import Reviews from '../components/Reviews'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import { QUOTE_STATUS_LABELS, EVENT_TYPES } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page) => void
}

export default function MyQuotesPage({ user, goToPage }: Props) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editQuote, setEditQuote] = useState<any | null>(null)
  const [confirmClose, setConfirmClose] = useState<string | null>(null)
  const [celebrationQuote, setCelebrationQuote] = useState<any | null>(null)
  const [reviewQuote, setReviewQuote] = useState<any | null>(null)

  // Edit form state
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [guestsCount, setGuestsCount] = useState('')
  const [durationHours, setDurationHours] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { loadQuotes() }, [])

  const loadQuotes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('quotes')
      .select(`
        *,
        spaces(id, name, city, state, category, media_urls, whatsapp),
        suppliers(id, name, category, media_urls, whatsapp, cities)
      `)
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false })
    setQuotes(data || [])
    setLoading(false)
  }

  const acceptQuote = async (q: any) => {
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', q.id)
    setCelebrationQuote(q)
    loadQuotes()
  }

  const closeQuote = async (id: string) => {
    await supabase.from('quotes').update({ status: 'closed' }).eq('id', id)
    setConfirmClose(null)
    loadQuotes()
  }

  const openEdit = (q: any) => {
    setEditQuote(q)
    setEventType(q.event_type || '')
    setEventDate(q.event_date || '')
    setEventTime(q.event_time || '')
    setGuestsCount(q.guests_count?.toString() || '')
    setDurationHours(q.duration_hours?.toString() || '')
    setMessage(q.message || '')
  }

  const saveEdit = async () => {
    if (!editQuote) return
    setSubmitting(true)
    await supabase.from('quotes').update({
      event_type: eventType,
      event_date: eventDate,
      event_time: eventTime,
      guests_count: guestsCount ? parseInt(guestsCount) : null,
      duration_hours: durationHours ? parseFloat(durationHours) : null,
      message,
    }).eq('id', editQuote.id)
    setEditQuote(null)
    setSubmitting(false)
    loadQuotes()
  }

  const fmtDate = (d: string) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const STATUS_COLOR: Record<string, string> = {
    pending: '#d97706', viewed: '#7c3aed', responded: '#2563eb',
    accepted: '#16a34a', closed: '#6b7280', rejected: '#dc2626'
  }
  const STATUS_LABEL: Record<string, string> = {
    pending: 'Aguardando', viewed: 'Visto', responded: 'Respondido',
    accepted: 'Aceito', closed: 'Fechado', rejected: 'Recusado'
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>Carregando orçamentos...</div>

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Meus orçamentos</h1>
        <button onClick={() => goToPage('listing')} className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
          + Buscar espaços
        </button>
      </div>

      {quotes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: '#f9fafb', borderRadius: 14 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Nenhum orçamento ainda</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Busque espaços ou fornecedores e solicite orçamentos gratuitos.</p>
          <button className="btn-primary" onClick={() => goToPage('listing')}>Buscar espaços →</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {quotes.map(q => {
          const listing = q.spaces || q.suppliers
          const isSupplier = !!q.supplier_id
          const expanded = expandedId === q.id
          return (
            <div key={q.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: 12 }}
                onClick={() => setExpandedId(expanded ? null : q.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img src={listing?.media_urls?.[0] || 'https://placehold.co/56x56/f3f4f6/9ca3af?text=?'}
                    style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover' }} alt="" />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                      {listing?.name || 'Anúncio'}
                      {isSupplier && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 8 }}>Fornecedor</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      🎉 {q.event_type} · {fmtDate(q.event_date)}
                      {q.guests_count && ` · ${q.guests_count} convidados`}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      {new Date(q.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {q.proposed_price && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>Valor proposto</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#5aa800' }}>
                        R$ {Number(q.proposed_price).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  )}
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100,
                    background: `${STATUS_COLOR[q.status] || '#9ca3af'}18`, color: STATUS_COLOR[q.status] || '#9ca3af' }}>
                    {STATUS_LABEL[q.status] || q.status}
                  </span>
                  <span style={{ fontSize: 18, color: '#9ca3af' }}>{expanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Expanded */}
              {expanded && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px', background: '#fafafa' }}>
                  {q.host_response && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', marginBottom: 4 }}>✉️ Resposta do anunciante</div>
                      <p style={{ fontSize: 13, color: '#1a2e05', margin: 0 }}>{q.host_response}</p>
                      {q.proposed_price && (
                        <div style={{ marginTop: 8, fontSize: 13, color: '#166534', fontWeight: 700 }}>
                          Valor proposto: R$ {Number(q.proposed_price).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {listing?.whatsapp && (
                      <a href={`https://wa.me/55${listing.whatsapp.replace(/D/g, '')}?text=Olá! Vi meu orçamento na plataforma Ewind.`}
                        target="_blank" rel="noreferrer"
                        style={{ padding: '8px 16px', background: '#25d366', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                        💬 WhatsApp
                      </a>
                    )}
                    {q.status === 'responded' && (
                      <button onClick={() => acceptQuote(q)}
                        style={{ padding: '8px 16px', background: '#5aa800', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✓ Aceitar orçamento
                      </button>
                    )}
                    {(q.status === 'accepted') && (
                      <>
                        {confirmClose === q.id ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#dc2626' }}>Confirmar?</span>
                            <button onClick={() => closeQuote(q.id)} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Sim</button>
                            <button onClick={() => setConfirmClose(null)} style={{ padding: '6px 12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Não</button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmClose(q.id)}
                            style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                            🤝 Fechar negócio
                          </button>
                        )}
                      </>
                    )}
                    {(q.status === 'closed' || q.status === 'accepted') && (
                      <button onClick={() => setReviewQuote(q)}
                        style={{ padding: '8px 16px', background: '#fff', color: '#5aa800', border: '1.5px solid #a3e635', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✍️ Avaliar
                      </button>
                    )}
                    {(q.status === 'pending' || q.status === 'viewed') && (
                      <button onClick={() => openEdit(q)}
                        style={{ padding: '8px 16px', background: '#fff', color: '#6b7280', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✏️ Editar solicitação
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>✏️ Editar solicitação</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fg">
                <label>Tipo de evento *</label>
                <select value={eventType} onChange={e => setEventType(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                  <option value="">Selecione...</option>
                  {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fg"><label>Data *</label><input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} /></div>
                <div className="fg"><label>Horário</label><input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="fg"><label>Convidados *</label><input type="number" value={guestsCount} onChange={e => setGuestsCount(e.target.value)} min="1" /></div>
                <div className="fg"><label>Duração (horas)</label><input type="number" value={durationHours} onChange={e => setDurationHours(e.target.value)} step="0.5" min="1" /></div>
              </div>
              <div className="fg">
                <label>Mensagem</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveEdit} disabled={submitting} className="btn-primary" style={{ flex: 1, padding: '11px', fontSize: 14 }}>
                  {submitting ? 'Salvando...' : 'Salvar alterações'}
                </button>
                <button onClick={() => setEditQuote(null)} style={{ flex: 1, padding: '11px', fontSize: 14, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {celebrationQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 40, maxWidth: 400, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Negócio fechado!</h2>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
              Você aceitou o orçamento de <strong>{celebrationQuote.spaces?.name || celebrationQuote.suppliers?.name}</strong>.
            </p>
            <button onClick={() => setCelebrationQuote(null)} className="btn-primary" style={{ padding: '11px 28px', fontSize: 15 }}>Continuar →</button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>✍️ Deixar avaliação</h2>
            <Reviews
              spaceId={reviewQuote.space_id}
              supplierId={reviewQuote.supplier_id}
              quoteId={reviewQuote.id}
              user={user}
              onClose={() => setReviewQuote(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
