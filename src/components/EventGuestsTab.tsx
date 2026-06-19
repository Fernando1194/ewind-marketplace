import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventGuest } from '../types'

interface Props {
  user: User
  event: EventItem
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'Confirmado', color: '#16a34a', bg: '#f0fdf4' },
  declined:  { label: 'Recusado', color: '#dc2626', bg: '#fef2f2' },
  pending:   { label: 'Pendente', color: '#d97706', bg: '#fffbeb' },
}

export default function EventGuestsTab({ user, event }: Props) {
  const [guests, setGuests] = useState<EventGuest[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [newName, setNewName] = useState('')
  const [costPerGuest, setCostPerGuest] = useState(event.cost_per_guest ? String(event.cost_per_guest) : '')
  const [savingCost, setSavingCost] = useState(false)
  const [importMsg, setImportMsg] = useState('')

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

  const confirmed = guests.filter(g => g.status === 'confirmed').length
  const declined = guests.filter(g => g.status === 'declined').length
  const pending = guests.filter(g => g.status === 'pending').length

  const addGuest = async () => {
    if (!newName.trim()) return
    await supabase.from('event_guests').insert({
      event_id: event.id, owner_id: user.id, name: newName.trim(), status: 'pending',
    })
    setNewName('')
    load()
  }

  const updateStatus = async (g: EventGuest, status: string) => {
    await supabase.from('event_guests').update({ status }).eq('id', g.id)
    load()
  }

  const removeGuest = async (id: string) => {
    await supabase.from('event_guests').delete().eq('id', id)
    load()
  }

  const saveCost = async () => {
    setSavingCost(true)
    await supabase.from('events').update({ cost_per_guest: costPerGuest ? parseFloat(costPerGuest) : null }).eq('id', event.id)
    setSavingCost(false)
  }

  // Importação de Excel
  const handleImport = async (file: File | null) => {
    if (!file) return
    setImporting(true)
    setImportMsg('')
    try {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      // Detecta coluna de nome e status (heurística simples)
      const parsed: { name: string; status: string }[] = []
      let startRow = 0
      // Se a primeira linha parecer cabeçalho, pula
      const firstRow = (rows[0] || []).map((x: any) => String(x).toLowerCase())
      const hasHeader = firstRow.some((c: string) => c.includes('nome') || c.includes('name') || c.includes('convidado'))
      if (hasHeader) startRow = 1

      for (let i = startRow; i < rows.length; i++) {
        const row = rows[i]
        if (!row || !row[0]) continue
        const name = String(row[0]).trim()
        if (!name) continue
        // status na 2ª coluna, se houver
        let status = 'pending'
        const raw = String(row[1] || '').toLowerCase().trim()
        if (raw.includes('confirm') || raw === 'sim' || raw === 'yes') status = 'confirmed'
        else if (raw.includes('recus') || raw.includes('declin') || raw === 'não' || raw === 'nao' || raw === 'no') status = 'declined'
        parsed.push({ name, status })
      }

      if (parsed.length === 0) {
        setImportMsg('Nenhum convidado encontrado. Verifique se a primeira coluna tem os nomes.')
        setImporting(false)
        return
      }

      const toInsert = parsed.map(p => ({ event_id: event.id, owner_id: user.id, name: p.name, status: p.status }))
      const { error } = await supabase.from('event_guests').insert(toInsert)
      if (error) { setImportMsg('Erro ao importar: ' + error.message); setImporting(false); return }

      setImportMsg(`✅ ${parsed.length} convidado(s) importado(s) com sucesso!`)
      load()
    } catch (err: any) {
      setImportMsg('Não consegui ler o arquivo. Use um .xlsx com os nomes na primeira coluna.')
    } finally {
      setImporting(false)
    }
  }

  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const estimatedCost = costPerGuest ? confirmed * parseFloat(costPerGuest) : 0

  return (
    <div>
      {/* Contadores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 20 }}>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{guests.length}</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Confirmados</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{confirmed}</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Recusados</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{declined}</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Pendentes</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#d97706' }}>{pending}</div>
        </div>
      </div>

      {/* Custo por convidado (informativo) */}
      <div style={{ background: '#f0fdf4', border: '1px dashed #a3e635', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="fg" style={{ margin: 0 }}>
            <label style={{ color: '#3f6212', fontWeight: 600 }}>Valor por convidado (R$)</label>
            <input type="number" value={costPerGuest} onChange={e => setCostPerGuest(e.target.value)} onBlur={saveCost} placeholder="Ex: 150" style={{ maxWidth: 140 }} />
          </div>
          <div style={{ fontSize: 13, color: '#3f6212', paddingBottom: 8 }}>
            {costPerGuest ? (
              <>Custo estimado ({confirmed} confirmados): <strong>{money(estimatedCost)}</strong></>
            ) : (
              'Preencha para estimar o custo com base nos confirmados.'
            )}
            {savingCost && <span style={{ marginLeft: 8, color: '#9ca3af' }}>salvando...</span>}
          </div>
        </div>
        <p style={{ fontSize: 11, color: '#65a30d', marginTop: 8, marginBottom: 0 }}>
          ℹ️ Este valor é apenas informativo e não entra no total financeiro do evento.
        </p>
      </div>

      {/* Importar Excel + adicionar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: '#2d2d2d', background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, padding: '9px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
          📄 Importar Excel (.xlsx)
          <input type="file" accept=".xlsx,.xls" onChange={e => handleImport(e.target.files?.[0] || null)} style={{ display: 'none' }} disabled={importing} />
        </label>
        {importing && <span style={{ fontSize: 13, color: '#9ca3af' }}>Importando...</span>}
        <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGuest()} placeholder="Adicionar convidado manualmente" style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
          <button className="btn-primary" onClick={addGuest} disabled={!newName.trim()} style={{ padding: '9px 18px', fontSize: 13 }}>+ Adicionar</button>
        </div>
      </div>

      {importMsg && (
        <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, background: importMsg.startsWith('✅') ? '#f0fdf4' : '#fef2f2', color: importMsg.startsWith('✅') ? '#3f6212' : '#991b1b' }}>
          {importMsg}
        </div>
      )}

      {/* Dica de formato */}
      {guests.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: '#f9fafb', borderRadius: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>👥</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nenhum convidado ainda</h3>
          <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 440, margin: '0 auto' }}>
            Importe um Excel (nomes na 1ª coluna, status opcional na 2ª: "confirmado" / "recusado") ou adicione manualmente acima.
          </p>
        </div>
      )}

      {/* Lista */}
      {guests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {guests.map(g => {
            const sm = STATUS_META[g.status]
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, gap: 10, flexWrap: 'wrap' }}>
                <div style={{ fontSize: 14, fontWeight: 600, flex: 1, minWidth: 120 }}>{g.name}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {(['confirmed', 'pending', 'declined'] as const).map(st => (
                    <button key={st} onClick={() => updateStatus(g, st)}
                      style={{
                        fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit',
                        border: `1.5px solid ${g.status === st ? STATUS_META[st].color : '#e8e8e8'}`,
                        background: g.status === st ? STATUS_META[st].bg : '#fff',
                        color: g.status === st ? STATUS_META[st].color : '#9ca3af',
                      }}>
                      {STATUS_META[st].label}
                    </button>
                  ))}
                  <button onClick={() => removeGuest(g.id)} title="Remover" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5, padding: 4 }}>🗑️</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
