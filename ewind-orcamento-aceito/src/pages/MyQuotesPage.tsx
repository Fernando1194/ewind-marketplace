import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Quote } from '../types'
import { QUOTE_STATUS_LABELS } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page) => void
}

export default function MyQuotesPage({ user, goToPage }: Props) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('quotes')
      .select(`
        *,
        spaces (
          id, name, city, state, category, media_urls, price_per_hour, price_per_day, host_id, capacity, min_hours, address, description, attributes, event_types, status, created_at, updated_at
        )
      `)
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setQuotes(data as any)
    setLoading(false)
  }

  const acceptQuote = async (id: string) => {
    await supabase
      .from('quotes')
      .update({ status: 'accepted' })
      .eq('id', id)
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'accepted' } : q))
  }

  const cancelQuote = async (id: string) => {
    if (!confirm('Cancelar este orçamento?')) return
    const { error } = await supabase
      .from('quotes')
      .update({ status: 'closed' })
      .eq('id', id)
    if (!error) loadQuotes()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Meus orçamentos</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Acompanhe suas solicitações</p>

      {loading && <p>Carregando...</p>}

      {!loading && quotes.length === 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Você ainda não solicitou nenhum orçamento</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Explore os espaços disponíveis e solicite seu primeiro orçamento!</p>
          <button className="btn-primary" onClick={() => goToPage('listing')}>
            Explorar espaços
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {quotes.map(q => {
          const status = QUOTE_STATUS_LABELS[q.status]
          return (
            <div key={q.id} style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {q.spaces && (
                  <img
                    src={q.spaces.media_urls?.[0] || 'https://via.placeholder.com/120x80?text=Sem+foto'}
                    alt={q.spaces.name}
                    style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10 }}
                  />
                )}

                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{q.spaces?.name || 'Espaço'}</h3>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>📍 {q.spaces?.city}, {q.spaces?.state}</div>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '3px 10px',
                      borderRadius: 100, background: status.bg, color: status.color
                    }}>{status.label}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>Evento</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{q.event_type}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>Data</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(q.event_date)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>Convidados</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{q.guests_count}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>Duração</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{q.duration_hours}h</div>
                    </div>
                  </div>

                  {q.message && (
                    <div style={{ marginTop: 10, padding: 10, background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#4b5563' }}>
                      <strong>Sua mensagem:</strong> {q.message}
                    </div>
                  )}

                  {q.host_response && (
                    <div style={{ marginTop: 10, padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4 }}>💬 Resposta do fornecedor:</div>
                      <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.5 }}>{q.host_response}</div>
                      {q.proposed_price && (
                        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: '#166534' }}>
                          💰 Proposta: R$ {q.proposed_price.toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Orçamento aceito — mensagem de celebração */}
                  {q.status === 'accepted' && (
                    <div style={{ marginTop: 14, padding: '16px 20px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 28 }}>🎉</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#14532d' }}>Evento agendado!</div>
                          <div style={{ fontSize: 12, color: '#166534' }}>Seu orçamento foi aceito. Entre em contato com o anunciante para finalizar os detalhes.</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botão aceitar orçamento — aparece quando respondido */}
                  {q.status === 'responded' && q.host_response && (
                    <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => acceptQuote(q.id)}
                        style={{
                          padding: '10px 20px', fontSize: 13, fontWeight: 700,
                          background: '#a3e635', border: 'none',
                          borderRadius: 8, cursor: 'pointer', color: '#1a2e05',
                          fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        ✓ Aceitar orçamento
                      </button>
                      <button
                        onClick={() => cancelQuote(q.id)}
                        style={{
                          padding: '10px 16px', fontSize: 12, fontWeight: 600,
                          background: '#fff', border: '1.5px solid #fecaca',
                          borderRadius: 8, cursor: 'pointer', color: '#991b1b',
                          fontFamily: 'inherit'
                        }}
                      >
                        Recusar
                      </button>
                    </div>
                  )}

                  {(q.status === 'pending' || q.status === 'viewed') && (
                    <div style={{ marginTop: 12 }}>
                      <button
                        onClick={() => cancelQuote(q.id)}
                        style={{
                          padding: '7px 14px', fontSize: 12, fontWeight: 600,
                          background: '#fff', border: '1.5px solid #fecaca',
                          borderRadius: 8, cursor: 'pointer', color: '#991b1b'
                        }}
                      >
                        Cancelar solicitação
                      </button>
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
