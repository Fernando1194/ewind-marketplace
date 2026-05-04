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

export default function HostQuotesPage({ user, goToPage }: Props) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
          id, name, city, state, category, media_urls
        )
      `)
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setQuotes(data as any)
    setLoading(false)
  }

  const markAsViewed = async (id: string) => {
    await supabase
      .from('quotes')
      .update({ status: 'viewed' })
      .eq('id', id)
      .eq('status', 'pending')
  }

  const startResponse = (quote: Quote) => {
    setRespondingTo(quote.id)
    setResponseText('')
    setProposedPrice('')
    if (quote.status === 'pending') {
      markAsViewed(quote.id)
    }
  }

  const submitResponse = async (id: string) => {
    if (!responseText.trim()) {
      alert('Por favor, escreva uma resposta')
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('quotes')
        .update({
          host_response: responseText,
          proposed_price: proposedPrice ? parseFloat(proposedPrice) : null,
          status: 'responded',
          responded_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error

      setRespondingTo(null)
      setResponseText('')
      setProposedPrice('')
      await loadQuotes()
      alert('✅ Resposta enviada!')
    } catch (err: any) {
      alert('Erro: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    responded: quotes.filter(q => q.status === 'responded' || q.status === 'accepted').length,
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Orçamentos recebidos</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Responda às solicitações dos clientes</p>
        </div>
        <button className="btn-primary" onClick={() => goToPage('host-dashboard')}>
          ← Voltar ao painel
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, marginTop: 20 }}>
        <div className="stat-card">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-lab2">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#c05621' }}>{stats.pending}</div>
          <div className="stat-lab2">Pendentes</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#5aa800' }}>{stats.responded}</div>
          <div className="stat-lab2">Respondidos</div>
        </div>
      </div>

      {loading && <p>Carregando...</p>}

      {!loading && quotes.length === 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Sem orçamentos ainda</h3>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Quando alguém solicitar um orçamento, aparecerá aqui.</p>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {quotes.map(q => {
          const status = QUOTE_STATUS_LABELS[q.status]
          const isResponding = respondingTo === q.id
          const canRespond = q.status === 'pending' || q.status === 'viewed'

          return (
            <div key={q.id} style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {q.spaces && (
                  <img
                    src={(q.spaces as any).media_urls?.[0] || 'https://via.placeholder.com/120x90?text=Sem+foto'}
                    alt={(q.spaces as any).name}
                    style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 10 }}
                  />
                )}

                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{(q.spaces as any)?.name || 'Espaço'}</h3>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>Recebido em {formatDate(q.created_at)}</div>
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
                      <strong>Mensagem do cliente:</strong> {q.message}
                    </div>
                  )}

                  {q.host_response && !isResponding && (
                    <div style={{ marginTop: 10, padding: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4 }}>💬 Sua resposta:</div>
                      <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.5 }}>{q.host_response}</div>
                      {q.proposed_price && (
                        <div style={{ marginTop: 8, fontSize: 14, fontWeight: 700, color: '#166534' }}>
                          💰 R$ {q.proposed_price.toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  )}

                  {isResponding && (
                    <div style={{ marginTop: 14, padding: 14, background: '#fafafa', borderRadius: 10 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Sua resposta *</label>
                      <textarea
                        value={responseText}
                        onChange={e => setResponseText(e.target.value)}
                        placeholder="Olá! Temos disponibilidade para a data..."
                        rows={4}
                        style={{ width: '100%', padding: 10, border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', marginBottom: 10 }}
                      />
                      <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Preço proposto (R$)</label>
                      <input
                        type="number"
                        value={proposedPrice}
                        onChange={e => setProposedPrice(e.target.value)}
                        placeholder="Ex: 4500"
                        style={{ width: '100%', padding: 10, border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', marginBottom: 12 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => submitResponse(q.id)}
                          className="btn-primary"
                          disabled={submitting}
                          style={{ flex: 1 }}
                        >
                          {submitting ? 'Enviando...' : '✓ Enviar resposta'}
                        </button>
                        <button
                          onClick={() => setRespondingTo(null)}
                          style={{
                            padding: '10px 16px', fontSize: 13, fontWeight: 600,
                            background: '#fff', border: '1.5px solid #e8e8e8',
                            borderRadius: 8, cursor: 'pointer', color: '#2d2d2d'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {!isResponding && canRespond && (
                    <div style={{ marginTop: 12 }}>
                      <button
                        onClick={() => startResponse(q)}
                        className="btn-primary"
                      >
                        💬 Responder orçamento
                      </button>
                    </div>
                  )}

                  {!isResponding && !canRespond && q.status === 'responded' && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e', fontWeight: 500 }}>
                      ⏳ Proposta enviada — aguardando o cliente aceitar ou recusar
                    </div>
                  )}

                  {q.status === 'accepted' && (
                    <div style={{ marginTop: 12, padding: '16px 20px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', borderRadius: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 28 }}>🎉</span>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#14532d' }}>Evento agendado!</div>
                          <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                            O cliente aceitou sua proposta{q.proposed_price ? ` de R$ ${q.proposed_price.toLocaleString('pt-BR')}` : ''}. Entre em contato para finalizar os detalhes.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {q.status === 'closed' && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#f9fafb', border: '1px solid #e8e8e8', borderRadius: 8, fontSize: 12, color: '#9ca3af' }}>
                      Orçamento encerrado
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
