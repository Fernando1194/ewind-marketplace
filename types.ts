import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { EventItem, EventContract, ContractPayment, Page } from '../types'

interface Props {
  user: User
  event: EventItem
  goToPage: (p: Page, data?: any) => void
  back: () => void
}

const CONTRACT_CATEGORIES = ['Espaço', 'Buffet', 'Fotografia', 'Filmagem', 'Decoração', 'DJ/Música', 'Cerimonial', 'Doces e Bolos', 'Convites', 'Bar', 'Segurança', 'Transporte', 'Outro']

interface ContractWithPayments extends EventContract {
  payments: ContractPayment[]
}

export default function EventDetailPage({ user, event, back }: Props) {
  const [contracts, setContracts] = useState<ContractWithPayments[]>([])
  const [loading, setLoading] = useState(true)
  const [showContractForm, setShowContractForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const { data: cs } = await supabase
      .from('event_contracts')
      .select('*')
      .eq('event_id', event.id)
      .order('created_at', { ascending: true })
    const { data: ps } = await supabase
      .from('contract_payments')
      .select('*')
      .eq('owner_id', user.id)
      .order('due_date', { ascending: true })

    const list: ContractWithPayments[] = ((cs as EventContract[]) || []).map(c => ({
      ...c,
      payments: ((ps as ContractPayment[]) || []).filter(p => p.contract_id === c.id),
    }))
    setContracts(list)
    setLoading(false)
  }

  const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtDate = (d: string | null) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '—'
  const daysUntil = (d: string) => Math.ceil((new Date(d + 'T12:00:00').getTime() - Date.now()) / 86400000)

  // Totals
  const totalContracted = contracts.reduce((s, c) => s + Number(c.total_value || 0), 0)
  const allPayments = contracts.flatMap(c => c.payments)
  const totalPaid = allPayments.filter(p => p.paid).reduce((s, p) => s + Number(p.amount), 0)
  const totalPending = totalContracted - totalPaid
  const today = new Date().toISOString().split('T')[0]
  const upcoming = allPayments.filter(p => !p.paid && p.due_date >= today).sort((a, b) => a.due_date.localeCompare(b.due_date))
  const overdue = allPayments.filter(p => !p.paid && p.due_date < today)

  const togglePaid = async (p: ContractPayment) => {
    await supabase.from('contract_payments').update({
      paid: !p.paid,
      paid_date: !p.paid ? today : null,
    }).eq('id', p.id)
    load()
  }

  const budgetUsedPct = event.budget_total ? Math.min(100, (totalContracted / Number(event.budget_total)) * 100) : 0

  return (
    <div className="page-transition" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
      {/* Back + header */}
      <button onClick={back} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, padding: 0 }}>
        ← Meus eventos
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{event.name}</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>
          {event.type}{event.event_date && ` · ${fmtDate(event.event_date)}`}{event.guests_estimate && ` · ${event.guests_estimate} convidados`}
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Total contratado</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{money(totalContracted)}</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Já pago</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>{money(totalPaid)}</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>A pagar</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: totalPending > 0 ? '#d97706' : '#16a34a' }}>{money(totalPending)}</div>
        </div>
        {event.budget_total && (
          <div className="stat-card" style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Orçamento ({budgetUsedPct.toFixed(0)}%)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: budgetUsedPct > 100 ? '#dc2626' : '#2d2d2d' }}>{money(Number(event.budget_total))}</div>
          </div>
        )}
      </div>

      {/* Alerts: overdue & upcoming */}
      {overdue.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#991b1b' }}>
          ⚠️ <strong>{overdue.length} pagamento(s) em atraso</strong> — totalizando {money(overdue.reduce((s, p) => s + Number(p.amount), 0))}
        </div>
      )}
      {upcoming.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e' }}>
          🔔 Próximo vencimento: <strong>{fmtDate(upcoming[0].due_date)}</strong> ({money(Number(upcoming[0].amount))})
          {daysUntil(upcoming[0].due_date) <= 7 && <span> — em {daysUntil(upcoming[0].due_date)} dias</span>}
        </div>
      )}

      {/* Contracts header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Contratos e fornecedores</h2>
        {!showContractForm && (
          <button className="btn-primary" onClick={() => setShowContractForm(true)} style={{ padding: '9px 18px', fontSize: 13 }}>
            + Adicionar contrato
          </button>
        )}
      </div>

      {showContractForm && (
        <ContractForm
          user={user}
          eventId={event.id}
          categories={CONTRACT_CATEGORIES}
          onSaved={() => { setShowContractForm(false); load() }}
          onCancel={() => setShowContractForm(false)}
        />
      )}

      {/* Contracts list */}
      {loading ? (
        <div className="skeleton" style={{ height: 80, borderRadius: 12 }} />
      ) : contracts.length === 0 && !showContractForm ? (
        <div style={{ textAlign: 'center', padding: '50px 24px', background: '#f9fafb', borderRadius: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Nenhum contrato ainda. Adicione seu primeiro fornecedor acima.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contracts.map(c => {
            const paid = c.payments.filter(p => p.paid).reduce((s, p) => s + Number(p.amount), 0)
            const hasRisk = c.penalty_clause || c.cancellation_policy || c.special_clauses
            return (
              <div key={c.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
                <div onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                      {c.supplier_name}
                      {c.category && <span style={{ fontSize: 11, fontWeight: 600, color: '#5aa800', background: '#f0fdf4', padding: '2px 8px', borderRadius: 100, marginLeft: 8 }}>{c.category}</span>}
                      {hasRisk && <span title="Possui cláusulas de risco" style={{ marginLeft: 6 }}>⚠️</span>}
                      {c.contract_file_url && <span title="Contrato anexado" style={{ marginLeft: 4 }}>📎</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {money(paid)} pago de {money(Number(c.total_value))}
                      {c.payments.length > 0 && ` · ${c.payments.filter(p => p.paid).length}/${c.payments.length} parcelas`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>{money(Number(c.total_value))}</div>
                    <span style={{ fontSize: 14, color: '#9ca3af' }}>{expandedId === c.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedId === c.id && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 18px', background: '#fafafa' }}>
                    {/* Contact */}
                    {(c.contact_name || c.contact_phone || c.contact_email) && (
                      <div style={{ fontSize: 13, color: '#4b5563', marginBottom: 14 }}>
                        📞 {[c.contact_name, c.contact_phone, c.contact_email].filter(Boolean).join(' · ')}
                      </div>
                    )}

                    {/* Risk clauses */}
                    {hasRisk && (
                      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 14, marginBottom: 14 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#9a3412', marginBottom: 8 }}>⚠️ Cláusulas de atenção</div>
                        {c.penalty_clause && <div style={{ fontSize: 13, color: '#7c2d12', marginBottom: 6 }}><strong>Multa:</strong> {c.penalty_clause}</div>}
                        {c.cancellation_policy && <div style={{ fontSize: 13, color: '#7c2d12', marginBottom: 6 }}><strong>Cancelamento:</strong> {c.cancellation_policy}</div>}
                        {c.special_clauses && <div style={{ fontSize: 13, color: '#7c2d12' }}><strong>Especiais:</strong> {c.special_clauses}</div>}
                      </div>
                    )}

                    {/* Payments */}
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>PARCELAS</div>
                    {c.payments.length === 0 ? (
                      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Nenhuma parcela cadastrada.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                        {c.payments.map(p => {
                          const od = !p.paid && p.due_date < today
                          return (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', borderRadius: 8, border: `1px solid ${od ? '#fecaca' : '#eee'}` }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="checkbox" checked={p.paid} onChange={() => togglePaid(p)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#a3e635' }} />
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 600, textDecoration: p.paid ? 'line-through' : 'none', color: p.paid ? '#9ca3af' : '#2d2d2d' }}>
                                    {p.label || 'Parcela'} · {money(Number(p.amount))}
                                  </div>
                                  <div style={{ fontSize: 11, color: od ? '#dc2626' : '#9ca3af' }}>
                                    Vence {fmtDate(p.due_date)}{od && ' · EM ATRASO'}{p.paid && p.paid_date && ` · pago em ${fmtDate(p.paid_date)}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <PaymentForm user={user} contractId={c.id} onSaved={load} />

                    {c.contract_file_url && (
                      <a href={c.contract_file_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#5aa800', fontWeight: 600 }}>
                        📎 Ver contrato anexado
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Inline contract form ──────────────────────────────────────────
function ContractForm({ user, eventId, categories, onSaved, onCancel }: {
  user: User; eventId: string; categories: string[]; onSaved: () => void; onCancel: () => void
}) {
  const [supplierName, setSupplierName] = useState('')
  const [category, setCategory] = useState('')
  const [totalValue, setTotalValue] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [serviceDate, setServiceDate] = useState('')
  const [penalty, setPenalty] = useState('')
  const [cancellation, setCancellation] = useState('')
  const [special, setSpecial] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!supplierName.trim()) return
    setSaving(true)
    let fileUrl: string | null = null
    if (file) {
      const path = `${user.id}/${eventId}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('event-contracts').upload(path, file)
      if (!upErr) {
        const { data } = supabase.storage.from('event-contracts').getPublicUrl(path)
        fileUrl = data.publicUrl
      }
    }
    await supabase.from('event_contracts').insert({
      event_id: eventId,
      owner_id: user.id,
      supplier_name: supplierName.trim(),
      category: category || null,
      total_value: totalValue ? parseFloat(totalValue) : 0,
      contact_phone: contactPhone || null,
      service_date: serviceDate || null,
      penalty_clause: penalty || null,
      cancellation_policy: cancellation || null,
      special_clauses: special || null,
      contract_file_url: fileUrl,
    })
    setSaving(false)
    onSaved()
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Novo contrato</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div className="fg"><label>Fornecedor *</label><input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="Ex: Buffet Sabor & Arte" autoFocus /></div>
        <div className="fg"><label>Categoria</label><select value={category} onChange={e => setCategory(e.target.value)}><option value="">Selecione...</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="fg"><label>Valor total (R$)</label><input type="number" value={totalValue} onChange={e => setTotalValue(e.target.value)} placeholder="Ex: 12000" /></div>
        <div className="fg"><label>Telefone/contato</label><input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="(41) 99999-9999" /></div>
        <div className="fg"><label>Data do serviço</label><input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} /></div>
      </div>
      <details style={{ marginTop: 14 }}>
        <summary style={{ fontSize: 13, fontWeight: 600, color: '#92400e', cursor: 'pointer' }}>⚠️ Cláusulas de risco (multa, cancelamento, especiais)</summary>
        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          <div className="fg"><label>Multa por rescisão</label><input value={penalty} onChange={e => setPenalty(e.target.value)} placeholder="Ex: 30% do valor se cancelar com menos de 60 dias" /></div>
          <div className="fg"><label>Política de cancelamento</label><input value={cancellation} onChange={e => setCancellation(e.target.value)} placeholder="Ex: reembolso de 50% até 90 dias antes" /></div>
          <div className="fg"><label>Cláusulas especiais</label><input value={special} onChange={e => setSpecial(e.target.value)} placeholder="Ex: horário extra cobrado à parte" /></div>
        </div>
      </details>
      <div className="fg" style={{ marginTop: 14 }}>
        <label>Anexar contrato (PDF)</label>
        <input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="btn-primary" onClick={save} disabled={!supplierName.trim() || saving} style={{ padding: '9px 20px', fontSize: 13 }}>
          {saving ? 'Salvando...' : 'Salvar contrato'}
        </button>
        <button onClick={onCancel} style={{ padding: '9px 16px', fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>Cancelar</button>
      </div>
    </div>
  )
}

// ── Inline payment form ───────────────────────────────────────────
function PaymentForm({ user, contractId, onSaved }: { user: User; contractId: string; onSaved: () => void }) {
  const [show, setShow] = useState(false)
  const [label, setLabel] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!amount || !dueDate) return
    setSaving(true)
    await supabase.from('contract_payments').insert({
      contract_id: contractId,
      owner_id: user.id,
      label: label || null,
      amount: parseFloat(amount),
      due_date: dueDate,
    })
    setSaving(false)
    setLabel(''); setAmount(''); setDueDate(''); setShow(false)
    onSaved()
  }

  if (!show) return (
    <button onClick={() => setShow(true)} style={{ fontSize: 12, color: '#5aa800', background: 'none', border: '1px dashed #a3e635', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
      + Adicionar parcela
    </button>
  )

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
      <div className="fg" style={{ flex: 1, minWidth: 100, margin: 0 }}><label style={{ fontSize: 11 }}>Descrição</label><input value={label} onChange={e => setLabel(e.target.value)} placeholder="Entrada" style={{ fontSize: 13 }} /></div>
      <div className="fg" style={{ width: 110, margin: 0 }}><label style={{ fontSize: 11 }}>Valor</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="R$" style={{ fontSize: 13 }} /></div>
      <div className="fg" style={{ width: 150, margin: 0 }}><label style={{ fontSize: 11 }}>Vencimento</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ fontSize: 13 }} /></div>
      <button className="btn-primary" onClick={save} disabled={!amount || !dueDate || saving} style={{ padding: '8px 14px', fontSize: 12 }}>{saving ? '...' : 'OK'}</button>
      <button onClick={() => setShow(false)} style={{ padding: '8px 10px', fontSize: 12, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
    </div>
  )
}
