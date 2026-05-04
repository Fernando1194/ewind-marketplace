import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import { QUOTE_STATUS_LABELS } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page) => void
  onQuoteCountChange?: () => void
}

export default function HostQuotesPage({ user, goToPage, onQuoteCountChange }: Props) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'responded' | 'accepted'>('all')

  const loadQuotes = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('quotes')
      .select(`*, spaces (id, name, city, state, category, media_urls, price_per_hour, price_per_day, capacity, min_hours, status, created_at, updated_at)`)
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setQuotes(data as any)
    setLoading(false)
    onQuoteCountChange?.()
  }, [user.id, onQuoteCountChange])

  useEffect(() => { loadQuotes() }, [loadQuotes])

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending' || q.status === 'viewed').length,
    responded: quotes.filter(q => q.status === 'responded').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
  }

  const filtered = quotes.filter(q => {
    if (activeFilter === 'pending') return q.status === 'pending' || q.status === 'viewed'
    if (activeFilter === 'responded') return q.status === 'responded'
    if (activeFilter === 'accepted') return q.status === 'accepted'
    return true
  })

  const markAsViewed = async (id: string) => {
    await supabase.from('quotes').update({ status: 'viewed' }).eq('id', id).eq('status', 'pending')
    setQuotes(prev => prev.map(q => q.id === id && q.status === 'pending' ? { ...q, status: 'viewed' } : q))
  }

  const submitResponse = async (quoteId: string) => {
    if (!responseText.trim()) return
    setSubmitting(true)
    const { error } = await supabase.from('quotes').update({
      host_response: responseText,
      proposed_price: proposedPrice ? parseFloat(proposedPrice) : null,
      status: 'responded',
      responded_at: new Date().toISOString()
    }).eq('id', quoteId)
    if (!error) {
      setQuotes(prev => prev.map(q => q.id === quoteId ? {
        ...q, host_response: responseText,
        proposed_price: proposedPrice ? parseFloat(proposedPrice) : null,
        status: 'responded'
      } : q))
      setRespondingId(null)
      setResponseText('')
      setProposedPrice('')
    }
    setSubmitting(false)
  }

  const rejectQuote = async (id: string) => {
    await supabase.from('quotes').update({ status: 'rejected' }).eq('id', id)
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'rejected' } : q))
    setRejectConfirm(null)
  }

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
  const fmtTime = (t: string) => t ? t.substring(0, 5) : null

  const hoursAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'agora há pouco'
    if (h < 24) return `há ${h}h`
    return `há ${Math.floor(h / 24)} dia(s)`
  }

  const openRespond = async (q: any) => {
    setRespondingId(q.id)
    setResponseText('')
    setProposedPrice(q.spaces?.price_per_hour ? q.spaces.price_per_hour.toString() : q.spaces?.price_per_day?.toString() || '')
    if (q.status === 'pending') await markAsViewed(q.id)
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Orçamentos recebidos</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Responda em até 24h para melhor experiência</p>
        </div>
        <button onClick={loadQuotes} style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, background: '#f9fafb', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>
          🔄 Atualizar
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { key: 'all', label: 'Total', value: stats.total, color: '#6366f1' },
          { key: 'pending', label: 'Aguardando', value: stats.pending, color: '#f59e0b' },
          { key: 'responded', label: 'Respondidos', value: stats.responded, color: '#0ea5e9' },
          { key: 'accepted', label: '🎉 Aceitos', value: stats.accepted, color: '#16a34a' },
        ].map(s => (
          <button key={s.key} onClick={() => setActiveFilter(s.key as any)}
            style={{
              background: activeFilter === s.key ? `${s.color}10` : '#fff',
              borderRadius: 12, padding: '14px 16px',
              border: activeFilter === s.key ? `2px solid ${s.color}` : '1px solid #e8e8e8',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.2s'
            }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Aviso SLA */}
      {stats.pending > 0 && (
        <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
          <span style={{ fontSize: 18 }}>⚡</span>
          <span style={{ color: '#92400e' }}>
            Você tem <strong>{stats.pending} solicitação(ões)</strong> aguardando resposta. Responda em até 24h para uma melhor experiência!
          </span>
        </div>
      )}

      {loading && <p style={{ color: '#6b7280', fontSize: 14 }}>Carregando orçamentos...</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📬</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            {activeFilter === 'all' ? 'Nenhum orçamento recebido' : 'Nenhum orçamento nesta categoria'}
          </h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
            {activeFilter === 'all' ? 'Quando clientes solicitarem orçamentos, eles aparecerão aqui.' : 'Tente outro filtro.'}
          </p>
          <button className="btn-primary" onClick={() => goToPage('host-dashboard')}>Ver meus espaços</button>
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {filtered.map(q => {
          const status = QUOTE_STATUS_LABELS[q.status] || { label: q.status, bg: '#f3f4f6', color: '#6b7280' }
          const isNew = q.status === 'pending'
          const canRespond = q.status === 'pending' || q.status === 'viewed'
          const canReject = q.status === 'pending' || q.status === 'viewed'

          return (
            <div key={q.id} style={{
              background: '#fff',
              border: q.status === 'accepted' ? '2px solid #86efac' : isNew ? '2px solid #a3e635' : '1.5px solid #e8e8e8',
              borderRadius: 14, padding: 20, position: 'relative'
            }}>
              {isNew && (
                <div style={{ position: 'absolute', top: -10, left: 20, background: '#a3e635', color: '#1a2e05', fontSize: 10, fontWeight: 800, padding: '3px 12px', borderRadius: 100 }}>
                  NOVO
                </div>
              )}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {q.spaces?.media_urls?.[0] && (
                  <img src={q.spaces.media_urls[0]} alt={q.spaces?.name}
                    style={{ width: 110, height: 85, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                )}

                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{q.spaces?.name}</h3>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>📍 {q.spaces?.city}, {q.spaces?.state} · {hoursAgo(q.created_at)}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: status.bg, color: status.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Detalhes do pedido */}
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
                    {[
                      { label: 'Evento', value: q.event_type },
                      { label: 'Data', value: fmtDate(q.event_date) },
                      ...(fmtTime(q.event_time) ? [{ label: 'Horário', value: fmtTime(q.event_time) }] : []),
                      { label: 'Convidados', value: q.guests_count },
                      { label: 'Duração', value: `${q.duration_hours}h` },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {q.message && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#4b5563' }}>
                      <strong>Mensagem:</strong> {q.message}
                    </div>
                  )}

                  {/* Sua resposta */}
                  {q.host_response && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4 }}>✓ Sua resposta enviada:</div>
                      <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.5 }}>{q.host_response}</div>
                      {q.proposed_price && (
                        <div style={{ marginTop: 6, fontSize: 15, fontWeight: 800, color: '#166534' }}>
                          💰 Proposta: R$ {q.proposed_price.toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status especiais */}
                  {q.status === 'responded' && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                      ⏳ Aguardando o cliente aceitar ou recusar sua proposta
                    </div>
                  )}

                  {q.status === 'accepted' && (
                    <div style={{ marginTop: 12, padding: '14px 18px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 28 }}>🎉</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#14532d' }}>Evento confirmado!</div>
                        <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                          O cliente aceitou{q.proposed_price ? ` sua proposta de R$ ${q.proposed_price.toLocaleString('pt-BR')}` : ''}. Entre em contato para finalizar.
                        </div>
                      </div>
                    </div>
                  )}

                  {q.status === 'rejected' && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#991b1b' }}>
                      ✕ Solicitação recusada por você
                    </div>
                  )}

                  {q.status === 'closed' && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#f9fafb', border: '1px solid #e8e8e8', borderRadius: 8, fontSize: 12, color: '#9ca3af' }}>
                      Orçamento encerrado pelo cliente
                    </div>
                  )}

                  {/* Form de resposta */}
                  {respondingId === q.id && (
                    <div style={{ marginTop: 14, padding: 16, background: '#f9fafb', borderRadius: 12, border: '1.5px solid #e8e8e8' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>💬 Sua proposta para {q.event_type} em {fmtDate(q.event_date)}{fmtTime(q.event_time) ? ` às ${fmtTime(q.event_time)}` : ''}</div>
                      <div className="fg">
                        <label style={{ fontSize: 12 }}>Mensagem *</label>
                        <textarea value={responseText} onChange={e => setResponseText(e.target.value)} rows={3}
                          placeholder={`Olá! Temos disponibilidade para ${q.event_type} em ${fmtDate(q.event_date)}. Ficamos felizes em receber ${q.guests_count} convidados por ${q.duration_hours}h...`}
                          style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                      </div>
                      <div className="fg">
                        <label style={{ fontSize: 12 }}>Valor proposto (R$) — opcional</label>
                        <input type="number" value={proposedPrice} onChange={e => setProposedPrice(e.target.value)} placeholder="Ex: 4500" min={0} step={0.01} />
                        <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Deixe em branco para negociar por WhatsApp/Instagram</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => submitResponse(q.id)} className="btn-primary" style={{ flex: 1, padding: 11 }} disabled={submitting || !responseText.trim()}>
                          {submitting ? 'Enviando...' : '📤 Enviar proposta'}
                        </button>
                        <button onClick={() => setRespondingId(null)} style={{ padding: '11px 16px', fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  {respondingId !== q.id && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {canRespond && (
                        <button onClick={() => openRespond(q)}
                          style={{ padding: '9px 16px', fontSize: 12, fontWeight: 700, background: '#a3e635', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#1a2e05', fontFamily: 'inherit' }}>
                          💬 Responder
                        </button>
                      )}
                      {canReject && (
                        rejectConfirm === q.id ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 12, color: '#dc2626' }}>Recusar evento?</span>
                            <button onClick={() => rejectQuote(q.id)} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', fontFamily: 'inherit' }}>Sim</button>
                            <button onClick={() => setRejectConfirm(null)} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6b7280', fontFamily: 'inherit' }}>Não</button>
                          </div>
                        ) : (
                          <button onClick={() => setRejectConfirm(q.id)}
                            style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #fecaca', borderRadius: 8, cursor: 'pointer', color: '#991b1b', fontFamily: 'inherit' }}>
                            ✕ Recusar
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
