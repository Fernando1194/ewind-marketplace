import { loc } from '../i18n'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventGuest } from '../types'
import { useEventFeedback, Toast, ConfirmModal } from './useEventFeedback'
import { downloadGuestTemplate, readGuestRows, parseGuestRows } from '../lib/guestSpreadsheet'

interface Props {
  user: User
  event: EventItem
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmado', color: '#16a34a', bg: '#f0fdf4' },
  declined:  { label: 'Recusado', color: '#dc2626', bg: '#fef2f2' },
  pending:   { label: 'Pendente', color: '#d97706', bg: '#fffbeb' },
}

const CATEGORY_META: Record<string, { label: string; short: string; icon: string }> = {
  adult: { label: 'Adulto', short: 'Adulto', icon: '🧑' },
  child: { label: 'Criança (5-10)', short: 'Criança', icon: '🧒' },
  baby:  { label: 'Bebê (<5)', short: 'Bebê', icon: '👶' },
}

const BILLING_META: Record<string, { label: string; factor: number }> = {
  full:   { label: 'Inteira', factor: 1 },
  half:   { label: 'Meia', factor: 0.5 },
  exempt: { label: 'Isento', factor: 0 },
}

export default function EventGuestsTab({ user, event }: Props) {
  const fb = useEventFeedback()
  const [guests, setGuests] = useState<EventGuest[]>([])
  const [savingGuest, setSavingGuest] = useState(false)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState('')
  const [costPerGuest, setCostPerGuest] = useState(event.cost_per_guest ? String(event.cost_per_guest) : '')
  const [savingCost, setSavingCost] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'declined' | 'pending'>('all')

  // novo convidado
  const [showAdd, setShowAdd] = useState(false)
  const [nName, setNName] = useState('')
  const [nCategory, setNCategory] = useState<'adult' | 'child' | 'baby'>('adult')
  const [nBilling, setNBilling] = useState<'full' | 'half' | 'exempt'>('full')
  const [nPhone, setNPhone] = useState('')
  const [nEmail, setNEmail] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('event_guests')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true })
    setGuests((data as EventGuest[]) || [])
    setLoading(false)
  }

  // Contadores
  const confirmed = guests.filter(g => g.status === 'confirmed')
  const declined = guests.filter(g => g.status === 'declined').length
  const pending = guests.filter(g => g.status === 'pending').length
  const adults = guests.filter(g => g.category === 'adult').length
  const children = guests.filter(g => g.category === 'child').length
  const babies = guests.filter(g => g.category === 'baby').length

  // Custo: soma o fator de cobrança apenas dos CONFIRMADOS
  const billableUnits = confirmed.reduce((s, g) => s + (BILLING_META[g.billing]?.factor ?? 1), 0)
  const estimatedCost = costPerGuest ? billableUnits * parseFloat(costPerGuest) : 0

  const money = (v: number) => v.toLocaleString(loc(), { style: 'currency', currency: 'BRL' })

  const saveCost = async () => {
    setSavingCost(true)
    await fb.run(() => supabase.from('events').update({ cost_per_guest: costPerGuest ? parseFloat(costPerGuest) : null }).eq('id', event.id))
    setSavingCost(false)
  }

  const addGuest = async () => {
    if (!nName.trim() || savingGuest) return
    setSavingGuest(true)
    const ok = await fb.run(() => supabase.from('event_guests').insert({
      event_id: event.id, owner_id: user.id, name: nName.trim(), status: 'pending',
      category: nCategory, billing: nBilling, phone: nPhone || null, email: nEmail || null,
    }))
    setSavingGuest(false)
    if (!ok) return
    setNName(''); setNPhone(''); setNEmail(''); setNCategory('adult'); setNBilling('full'); setShowAdd(false)
    load()
  }

  const updateGuest = async (g: EventGuest, patch: Partial<EventGuest>) => {
    const ok = await fb.run(() => supabase.from('event_guests').update(patch).eq('id', g.id))
    if (ok) load()
  }

  const removeGuest = (id: string) => {
    fb.confirm('Remover este convidado?', async () => {
      const ok = await fb.run(() => supabase.from('event_guests').delete().eq('id', id))
      if (ok) load()
    })
  }

  // Gera e baixa um template .xlsx padronizado
  const downloadTemplate = () => downloadGuestTemplate()

  // Importação de Excel com mapeamento de categoria/cobrança
  const handleImport = async (file: File | null) => {
    if (!file) return
    setImporting(true); setImportMsg('')
    try {
      const rows = await readGuestRows(file)
      const parsed = parseGuestRows(rows).map(g => ({ ...g, event_id: event.id, owner_id: user.id }))

      if (parsed.length === 0) {
        setImportMsg('Nenhum convidado encontrado. Verifique se a 1ª coluna tem os nomes.')
        setImporting(false); return
      }

      const { error } = await supabase.from('event_guests').insert(parsed)
      if (error) { setImportMsg('Erro ao importar: ' + error.message); setImporting(false); return }
      setImportMsg(`✅ ${parsed.length} convidado(s) importado(s)!`)
      load()
    } catch {
      setImportMsg('Não consegui ler o arquivo. Use um .xlsx com os nomes na 1ª coluna.')
    } finally {
      setImporting(false)
    }
  }

  const filtered = filterStatus === 'all' ? guests : guests.filter(g => g.status === filterStatus)

  return (
    <div>
      {/* Contadores principais */}
      <div data-tour="guests-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 14 }}>
        {[
          { label: 'Total', value: guests.length, color: '#1a1a1a' },
          { label: 'Confirmados', value: confirmed.length, color: '#16a34a' },
          { label: 'Recusados', value: declined, color: '#dc2626' },
          { label: 'Pendentes', value: pending, color: '#d97706' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 14 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Breakdown por categoria */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 18, fontSize: 13, color: '#6b7280', flexWrap: 'wrap' }}>
        <span>🧑 {adults} adultos</span>
        <span>🧒 {children} crianças</span>
        <span>👶 {babies} bebês</span>
      </div>

      {/* Custo estimado */}
      <div data-tour="guests-cost" style={{ background: '#f0fdf4', border: '1px dashed #a3e635', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="fg" style={{ margin: 0 }}>
            <label style={{ color: '#3f6212', fontWeight: 600 }}>Valor por convidado (R$)</label>
            <input type="number" value={costPerGuest} onChange={e => setCostPerGuest(e.target.value)} onBlur={saveCost} placeholder="Ex: 150" style={{ maxWidth: 140 }} />
          </div>
          <div style={{ fontSize: 13, color: '#3f6212', paddingBottom: 8 }}>
            {costPerGuest ? (
              <>Custo estimado: <strong>{money(estimatedCost)}</strong><br/>
              <span style={{ fontSize: 11 }}>{billableUnits} cobranças ({confirmed.length} confirmados, isentos não contam, meias contam metade)</span></>
            ) : (
              'Preencha para estimar o custo. Meia-entrada conta 50%, isentos não contam.'
            )}
            {savingCost && <span style={{ marginLeft: 8, color: '#9ca3af' }}>salvando...</span>}
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#65a30d', marginTop: 8, marginBottom: 0 }}>
          ℹ️ Valor informativo — não entra no total financeiro do evento.
        </p>
      </div>

      {/* Importar + adicionar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button data-tour="guests-template" onClick={downloadTemplate} style={{ fontSize: 13, fontWeight: 600, color: '#3f6212', background: '#f0fdf4', border: '1.5px solid #a3e635', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
          ⬇️ Baixar modelo
        </button>
        <label data-tour="guests-import" style={{ fontSize: 13, fontWeight: 600, color: '#2d2d2d', background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
          📄 Importar Excel
          <input type="file" accept=".xlsx" onChange={e => handleImport(e.target.files?.[0] || null)} style={{ display: 'none' }} disabled={importing} />
        </label>
        {importing && <span style={{ fontSize: 13, color: '#9ca3af' }}>Importando...</span>}
        <button data-tour="guests-add" className="btn-primary" onClick={() => setShowAdd(!showAdd)} style={{ padding: '9px 18px', fontSize: 13 }}>+ Adicionar convidado</button>
      </div>

      {importMsg && (
        <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: importMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: importMsg.startsWith('✅') ? '#3f6212' : '#991b1b' }}>
          {importMsg}
        </div>
      )}

      {/* Form de adicionar */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            <div className="fg" style={{ gridColumn: '1 / -1' }}><label>Nome *</label><input value={nName} onChange={e => setNName(e.target.value)} placeholder="Nome do convidado" autoFocus /></div>
            <div className="fg"><label>Categoria</label><select value={nCategory} onChange={e => setNCategory(e.target.value as any)}>{Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div className="fg"><label>Cobrança</label><select value={nBilling} onChange={e => setNBilling(e.target.value as any)}>{Object.entries(BILLING_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            <div className="fg"><label>Telefone</label><input value={nPhone} onChange={e => setNPhone(e.target.value)} placeholder="(41) 99999-9999" /></div>
            <div className="fg"><label>Email</label><input value={nEmail} onChange={e => setNEmail(e.target.value)} placeholder="email@exemplo.com" /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn-primary" onClick={addGuest} disabled={!nName.trim() || savingGuest} style={{ padding: '8px 18px', fontSize: 13 }}>{savingGuest ? 'Adicionando...' : 'Adicionar'}</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: '8px 14px', fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Filtros */}
      {guests.length > 0 && (
        <div data-tour="guests-filters" style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {([['all', 'Todos'], ['confirmed', 'Confirmados'], ['pending', 'Pendentes'], ['declined', 'Recusados']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setFilterStatus(k)}
              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                border: `1.5px solid ${filterStatus === k ? '#a3e635' : '#e8e8e8'}`, background: filterStatus === k ? '#f0fdf4' : '#fff', color: filterStatus === k ? '#3f6212' : '#6b7280' }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Lista vazia */}
      {guests.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: '#f9fafb', borderRadius: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nenhum convidado ainda</h3>
          <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 460, margin: '0 auto' }}>
            Importe um Excel ou adicione manualmente. No Excel, as colunas podem ser: <strong>Nome</strong> · Status · Categoria · Cobrança · Telefone · Email.
          </p>
        </div>
      )}

      {/* Lista */}
      {filtered.length > 0 && (
        <div data-tour="guests-list" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map(g => {
            const sm = STATUS_META[g.status]
            const cm = CATEGORY_META[g.category]
            const bm = BILLING_META[g.billing]
            const isOpen = expandedId === g.id
            return (
              <div key={g.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', gap: 10, flexWrap: 'wrap', cursor: 'pointer' }}
                  onClick={() => setExpandedId(isOpen ? null : g.id)}>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>
                      {cm.icon} {g.name}
                      {g.billing !== 'full' && <span style={{ fontSize: 10, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '1px 7px', borderRadius: 100, marginLeft: 6 }}>{bm.label}</span>}
                    </div>
                    {(g.phone || g.email) && <div style={{ fontSize: 11, color: '#9ca3af' }}>{[g.phone, g.email].filter(Boolean).join(' · ')}</div>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sm.color, background: sm.bg, padding: '3px 10px', borderRadius: 100 }}>{sm.label}</span>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 14px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Status */}
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>STATUS</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {(['confirmed', 'pending', 'declined'] as const).map(st => (
                          <button key={st} onClick={() => updateGuest(g, { status: st })}
                            style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit',
                              border: `1.5px solid ${g.status === st ? STATUS_META[st].color : '#e8e8e8'}`, background: g.status === st ? STATUS_META[st].bg : '#fff', color: g.status === st ? STATUS_META[st].color : '#9ca3af' }}>
                            {STATUS_META[st].label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Categoria + cobrança */}
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>CATEGORIA</div>
                        <select value={g.category} onChange={e => updateGuest(g, { category: e.target.value as any })} style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1.5px solid #e8e8e8', fontFamily: 'inherit' }}>
                          {Object.entries(CATEGORY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 4 }}>COBRANÇA</div>
                        <select value={g.billing} onChange={e => updateGuest(g, { billing: e.target.value as any })} style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1.5px solid #e8e8e8', fontFamily: 'inherit' }}>
                          {Object.entries(BILLING_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={() => removeGuest(g.id)} style={{ alignSelf: 'flex-start', fontSize: 12, color: '#991b1b', background: 'none', border: '1px solid #fecaca', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Remover convidado</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      <Toast toast={fb.toast} />
      <ConfirmModal state={fb.confirmState} onClose={() => fb.setConfirmState(null)} />
    </div>
  )
}
