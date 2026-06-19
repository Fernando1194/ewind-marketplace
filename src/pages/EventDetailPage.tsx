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
  const [editingContract, setEditingContract] = useState<EventContract | null>(null)
  const [editingPayment, setEditingPayment] = useState<ContractPayment | null>(null)

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

  const deleteContract = async (id: string) => {
    if (!confirm('Excluir este contrato e todas as suas parcelas? Esta ação não pode ser desfeita.')) return
    await supabase.from('event_contracts').delete().eq('id', id)
    setExpandedId(null)
    load()
  }

  const deletePayment = async (id: string) => {
    if (!confirm('Excluir esta parcela?')) return
    await supabase.from('contract_payments').delete().eq('id', id)
    load()
  }

  const openContractFile = async (path: string) => {
    // Gera URL assinada temporária (60s) para o bucket privado
    const { data, error } = await supabase.storage.from('event-contracts').createSignedUrl(path, 60)
    if (!error && data?.signedUrl) {
      window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
    } else {
      alert('Não foi possível abrir o contrato. Tente novamente.')
    }
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

                {expandedId === c.id && editingContract?.id === c.id && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 18px', background: '#fafafa' }}>
                    <ContractForm
                      user={user}
                      eventId={event.id}
                      categories={CONTRACT_CATEGORIES}
                      existing={editingContract}
                      onSaved={() => { setEditingContract(null); load() }}
                      onCancel={() => setEditingContract(null)}
                    />
                  </div>
                )}

                {expandedId === c.id && editingContract?.id !== c.id && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 18px', background: '#fafafa' }}>
                    {/* Edit / delete actions */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingContract(c)} style={{ fontSize: 12, fontWeight: 600, color: '#2d2d2d', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>✏️ Editar contrato</button>
                      <button onClick={() => deleteContract(c.id)} style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', background: '#fff', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>🗑️ Excluir</button>
                    </div>
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
                              <div style={{ display: 'flex', gap: 4 }}>
                                <button onClick={() => setEditingPayment(p)} title="Editar parcela" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 4, opacity: 0.6 }}>✏️</button>
                                <button onClick={() => deletePayment(p.id)} title="Excluir parcela" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 4, opacity: 0.6 }}>🗑️</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {editingPayment && editingPayment.contract_id === c.id && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>EDITANDO PARCELA</div>
                        <PaymentForm user={user} contractId={c.id} existing={editingPayment} onSaved={() => { setEditingPayment(null); load() }} onCancel={() => setEditingPayment(null)} />
                      </div>
                    )}
                    <PaymentForm user={user} contractId={c.id} onSaved={load} />

                    {c.contract_file_url && (
                      <button onClick={() => openContractFile(c.contract_file_url!)} style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: '#5aa800', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                        📎 Ver contrato anexado
                      </button>
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
function ContractForm({ user, eventId, categories, existing, onSaved, onCancel }: {
  user: User; eventId: string; categories: string[]
  existing?: EventContract | null
  onSaved: () => void; onCancel: () => void
}) {
  const isEdit = !!existing
  const [supplierName, setSupplierName] = useState(existing?.supplier_name || '')
  const [category, setCategory] = useState(existing?.category || '')
  const [totalValue, setTotalValue] = useState(existing?.total_value ? String(existing.total_value) : '')
  const [contactPhone, setContactPhone] = useState(existing?.contact_phone || '')
  const [serviceDate, setServiceDate] = useState(existing?.service_date || '')
  const [penalty, setPenalty] = useState(existing?.penalty_clause || '')
  const [cancellation, setCancellation] = useState(existing?.cancellation_policy || '')
  const [special, setSpecial] = useState(existing?.special_clauses || '')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [showClauses, setShowClauses] = useState(!!(existing?.penalty_clause || existing?.cancellation_policy || existing?.special_clauses))

  // ── IA extraction state ──
  const [aiStatus, setAiStatus] = useState<'idle' | 'reading' | 'analyzing' | 'done' | 'scanned' | 'error'>('idle')
  const [aiReviewed, setAiReviewed] = useState(false)   // usuário precisa confirmar revisão
  const [aiConfidence, setAiConfidence] = useState<string | null>(null)
  const [aiErrorDetail, setAiErrorDetail] = useState<string>('')

  const handleFile = async (f: File | null) => {
    setFile(f)
    setAiStatus('idle'); setAiReviewed(false); setAiConfidence(null)
    if (!f) return

    // Só tenta extrair de PDF
    const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) return  // imagens: sem extração automática (precisaria OCR)

    try {
      setAiStatus('reading')
      const { extractPdfText } = await import('../lib/pdfText')
      const { text, scanned } = await extractPdfText(f)

      if (scanned) { setAiStatus('scanned'); return }

      setAiStatus('analyzing')
      const resp = await fetch('/api/extract-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: text }),
      })
      const result = await resp.json().catch(() => ({}))
      if (!resp.ok || !result.fields) {
        setAiErrorDetail(result?.detail || result?.error || `HTTP ${resp.status}`)
        setAiStatus('error')
        return
      }
      const { fields } = result

      // Preenche apenas campos vazios OU sempre? Preenchemos sempre que a IA achou algo,
      // mas o usuário revisa tudo antes de salvar.
      if (fields.supplier_name) setSupplierName(fields.supplier_name)
      if (fields.category && categories.includes(fields.category)) setCategory(fields.category)
      if (fields.total_value != null) setTotalValue(String(fields.total_value))
      if (fields.service_date) setServiceDate(fields.service_date)
      if (fields.contact_phone) setContactPhone(fields.contact_phone)
      if (fields.penalty_clause || fields.cancellation_policy || fields.special_clauses) {
        setShowClauses(true)
        if (fields.penalty_clause) setPenalty(fields.penalty_clause)
        if (fields.cancellation_policy) setCancellation(fields.cancellation_policy)
        if (fields.special_clauses) setSpecial(fields.special_clauses)
      }
      setAiConfidence(fields.confidence || null)
      setAiStatus('done')
    } catch (err: any) {
      setAiErrorDetail(err?.message ? `leitura do PDF: ${err.message}` : 'erro ao ler o PDF')
      setAiStatus('error')
    }
  }

  const save = async () => {
    if (!supplierName.trim()) return
    // Se a IA preencheu e o usuário ainda não confirmou a revisão, bloqueia
    if (aiStatus === 'done' && !aiReviewed) return
    setSaving(true)

    let fileUrl: string | null = existing?.contract_file_url || null
    if (file) {
      const path = `${user.id}/${eventId}/${Date.now()}-${file.name}`
      const { error: upErr } = await supabase.storage.from('event-contracts').upload(path, file)
      if (!upErr) fileUrl = path
    }

    const payload = {
      supplier_name: supplierName.trim(),
      category: category || null,
      total_value: totalValue ? parseFloat(totalValue) : 0,
      contact_phone: contactPhone || null,
      service_date: serviceDate || null,
      penalty_clause: penalty || null,
      cancellation_policy: cancellation || null,
      special_clauses: special || null,
      contract_file_url: fileUrl,
    }

    if (isEdit) {
      await supabase.from('event_contracts').update(payload).eq('id', existing!.id)
    } else {
      await supabase.from('event_contracts').insert({ event_id: eventId, owner_id: user.id, ...payload })
    }
    setSaving(false)
    onSaved()
  }

  const saveBlocked = aiStatus === 'done' && !aiReviewed

  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 14, padding: 20, marginBottom: 16 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>{isEdit ? 'Editar contrato' : 'Novo contrato'}</h3>

      {/* Upload + IA primeiro, para já preencher os campos */}
      {!isEdit && (
        <div className="fg" style={{ marginBottom: 14, background: '#f0fdf4', border: '1px dashed #a3e635', borderRadius: 10, padding: 14 }}>
          <label style={{ fontWeight: 700, color: '#3f6212' }}>🤖 Anexar contrato (PDF) — preenchimento automático</label>
          <p style={{ fontSize: 12, color: '#4d7c0f', margin: '4px 0 8px' }}>
            Suba o PDF e a IA tenta preencher os campos abaixo. Você revisa e confirma antes de salvar.
          </p>
          <input type="file" accept=".pdf,image/*" onChange={e => handleFile(e.target.files?.[0] || null)} />

          {aiStatus === 'reading' && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>📖 Lendo o PDF...</p>}
          {aiStatus === 'analyzing' && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>🤖 Analisando cláusulas...</p>}
          {aiStatus === 'scanned' && (
            <p style={{ fontSize: 12, color: '#92400e', marginTop: 8, background: '#fffbeb', padding: '8px 10px', borderRadius: 6 }}>
              ⚠️ Este PDF parece ser escaneado (imagem), sem texto que a IA consiga ler. O arquivo será anexado, mas preencha os campos manualmente.
            </p>
          )}
          {aiStatus === 'error' && (
            <div style={{ fontSize: 12, color: '#991b1b', marginTop: 8, background: '#fef2f2', padding: '8px 10px', borderRadius: 6 }}>
              Não consegui extrair os dados automaticamente. O arquivo será anexado — preencha os campos manualmente.
              {aiErrorDetail && <div style={{ marginTop: 4, fontSize: 11, color: '#7f1d1d', fontFamily: 'monospace' }}>Detalhe: {aiErrorDetail}</div>}
            </div>
          )}
          {aiStatus === 'done' && (
            <div style={{ fontSize: 12, marginTop: 8, background: '#ecfccb', padding: '10px 12px', borderRadius: 8, color: '#3f6212' }}>
              ✅ Campos preenchidos pela IA{aiConfidence ? ` (confiança: ${aiConfidence})` : ''}. <strong>Revise tudo com atenção</strong> — a IA pode errar valores e datas.
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, cursor: 'pointer', fontWeight: 600 }}>
                <input type="checkbox" checked={aiReviewed} onChange={e => setAiReviewed(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#a3e635' }} />
                Revisei os campos e confirmo que estão corretos
              </label>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <div className="fg"><label>Fornecedor *</label><input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="Ex: Buffet Sabor & Arte" /></div>
        <div className="fg"><label>Categoria</label><select value={category} onChange={e => setCategory(e.target.value)}><option value="">Selecione...</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="fg"><label>Valor total (R$)</label><input type="number" value={totalValue} onChange={e => setTotalValue(e.target.value)} placeholder="Ex: 12000" /></div>
        <div className="fg"><label>Telefone/contato</label><input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="(41) 99999-9999" /></div>
        <div className="fg"><label>Data do serviço</label><input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} /></div>
      </div>

      <div style={{ marginTop: 14 }}>
        <button type="button" onClick={() => setShowClauses(s => !s)} style={{ fontSize: 13, fontWeight: 600, color: '#92400e', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', padding: 0 }}>
          ⚠️ Cláusulas de risco (multa, cancelamento, especiais) {showClauses ? '▲' : '▼'}
        </button>
        {showClauses && (
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <div className="fg"><label>Multa por rescisão</label><input value={penalty} onChange={e => setPenalty(e.target.value)} placeholder="Ex: 30% do valor se cancelar com menos de 60 dias" /></div>
            <div className="fg"><label>Política de cancelamento</label><input value={cancellation} onChange={e => setCancellation(e.target.value)} placeholder="Ex: reembolso de 50% até 90 dias antes" /></div>
            <div className="fg"><label>Cláusulas especiais</label><input value={special} onChange={e => setSpecial(e.target.value)} placeholder="Ex: horário extra cobrado à parte" /></div>
          </div>
        )}
      </div>

      {/* Em modo edição, troca de anexo opcional */}
      {isEdit && (
        <div className="fg" style={{ marginTop: 14 }}>
          <label>{existing?.contract_file_url ? 'Substituir contrato anexado (PDF)' : 'Anexar contrato (PDF)'}</label>
          <input type="file" accept=".pdf,image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
        <button className="btn-primary" onClick={save} disabled={!supplierName.trim() || saving || saveBlocked} style={{ padding: '9px 20px', fontSize: 13 }}>
          {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Salvar contrato'}
        </button>
        <button onClick={onCancel} style={{ padding: '9px 16px', fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>Cancelar</button>
        {saveBlocked && <span style={{ fontSize: 12, color: '#92400e' }}>Confirme a revisão dos campos acima para salvar</span>}
      </div>
    </div>
  )
}

// ── Inline payment form (cria ou edita) ──────────────────────
function PaymentForm({ user, contractId, existing, onSaved, onCancel }: {
  user: User; contractId: string
  existing?: ContractPayment | null
  onSaved: () => void; onCancel?: () => void
}) {
  const isEdit = !!existing
  const [show, setShow] = useState(isEdit)
  const [label, setLabel] = useState(existing?.label || '')
  const [amount, setAmount] = useState(existing?.amount ? String(existing.amount) : '')
  const [dueDate, setDueDate] = useState(existing?.due_date || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!amount || !dueDate) return
    setSaving(true)
    if (isEdit) {
      await supabase.from('contract_payments').update({
        label: label || null,
        amount: parseFloat(amount),
        due_date: dueDate,
      }).eq('id', existing!.id)
    } else {
      await supabase.from('contract_payments').insert({
        contract_id: contractId,
        owner_id: user.id,
        label: label || null,
        amount: parseFloat(amount),
        due_date: dueDate,
      })
    }
    setSaving(false)
    setLabel(''); setAmount(''); setDueDate('')
    if (!isEdit) setShow(false)
    onSaved()
  }

  if (!show && !isEdit) return (
    <button onClick={() => setShow(true)} style={{ fontSize: 12, color: '#5aa800', background: 'none', border: '1px dashed #a3e635', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
      + Adicionar parcela
    </button>
  )

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end', background: '#fff', padding: 12, borderRadius: 8, border: '1px solid #eee', marginBottom: isEdit ? 8 : 0 }}>
      <div className="fg" style={{ flex: 1, minWidth: 100, margin: 0 }}><label style={{ fontSize: 11 }}>Descrição</label><input value={label} onChange={e => setLabel(e.target.value)} placeholder="Entrada" style={{ fontSize: 13 }} /></div>
      <div className="fg" style={{ width: 110, margin: 0 }}><label style={{ fontSize: 11 }}>Valor</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="R$" style={{ fontSize: 13 }} /></div>
      <div className="fg" style={{ width: 150, margin: 0 }}><label style={{ fontSize: 11 }}>Vencimento</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ fontSize: 13 }} /></div>
      <button className="btn-primary" onClick={save} disabled={!amount || !dueDate || saving} style={{ padding: '8px 14px', fontSize: 12 }}>{saving ? '...' : isEdit ? 'Salvar' : 'OK'}</button>
      <button onClick={() => { if (isEdit && onCancel) onCancel(); else setShow(false) }} style={{ padding: '8px 10px', fontSize: 12, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>✕</button>
    </div>
  )
}
