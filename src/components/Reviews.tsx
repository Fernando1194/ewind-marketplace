import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

interface Props {
  spaceId?: string
  supplierId?: string
  user?: any
  quoteId?: string  // se fornecido, mostra form de avaliação
  onReviewSubmitted?: () => void
}

interface Review {
  id: string
  text: string
  created_at: string
  reviewer_id: string
  profiles?: { full_name: string }
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

export default function Reviews({ spaceId, supplierId, user, quoteId, onReviewSubmitted }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)
  const [avgResponseHours, setAvgResponseHours] = useState<number | null>(null)

  useEffect(() => {
    loadReviews()
    if (spaceId || supplierId) loadResponseTime()
  }, [spaceId, supplierId])

  const loadReviews = async () => {
    setLoading(true)
    const q = supabase
      .from('reviews')
      .select('id, text, created_at, reviewer_id, profiles!reviews_reviewer_id_fkey(full_name)')
      .order('created_at', { ascending: false })

    if (spaceId) q.eq('space_id', spaceId)
    else if (supplierId) q.eq('supplier_id', supplierId)

    const { data } = await q
    setReviews((data as any) || [])

    // checar se o usuário já avaliou este anúncio neste orçamento
    if (user && quoteId && data) {
      const mine = (data as any[]).find((r: any) => r.reviewer_id === user.id)
      if (mine) setAlreadyReviewed(true)
    }
    setLoading(false)
  }

  const loadResponseTime = async () => {
    const filter = spaceId
      ? supabase.from('quotes').select('created_at, responded_at').eq('space_id', spaceId).not('responded_at', 'is', null)
      : supabase.from('quotes').select('created_at, responded_at').eq('supplier_id', supplierId).not('responded_at', 'is', null)

    const { data } = await filter.limit(50)
    if (data && data.length > 0) {
      const diffs = data.map((q: any) => {
        const created = new Date(q.created_at).getTime()
        const responded = new Date(q.responded_at).getTime()
        return (responded - created) / (1000 * 60 * 60)
      })
      const avg = diffs.reduce((a: number, b: number) => a + b, 0) / diffs.length
      setAvgResponseHours(avg)
    }
  }

  const submitReview = async () => {
    if (!user) return
    if (!text.trim() || text.trim().length < 20) {
      setError('Escreva pelo menos 20 caracteres na avaliação')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { error: err } = await supabase.from('reviews').insert({
        quote_id: quoteId || null,
        reviewer_id: user.id,
        space_id: spaceId || null,
        supplier_id: supplierId || null,
        text: text.trim()
      })
      if (err) throw err
      setSubmitted(true)
      setAlreadyReviewed(true)
      setText('')
      await loadReviews()
      onReviewSubmitted?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar avaliação')
    }
    setSubmitting(false)
  }

  const responseLabel = (hours: number) => {
    if (hours < 2) return { label: 'Responde em menos de 2h', color: '#16a34a', bg: '#f0fdf4', icon: '⚡' }
    if (hours < 6) return { label: 'Responde em menos de 6h', color: '#16a34a', bg: '#f0fdf4', icon: '✅' }
    if (hours < 24) return { label: 'Responde em menos de 24h', color: '#d97706', bg: '#fffbeb', icon: '🕐' }
    return { label: 'Responde em mais de 24h', color: '#9ca3af', bg: '#f9fafb', icon: '⏳' }
  }

  return (
    <div>
      {/* Badge de tempo de resposta */}
      {avgResponseHours !== null && (() => {
        const badge = responseLabel(avgResponseHours)
        return (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: badge.bg, border: `1px solid ${badge.color}33`,
            borderRadius: 100, padding: '5px 12px', marginBottom: 20
          }}>
            <span style={{ fontSize: 14 }}>{badge.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: badge.color }}>{badge.label}</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              (média: {avgResponseHours < 1
                ? `${Math.round(avgResponseHours * 60)}min`
                : `${avgResponseHours.toFixed(1)}h`})
            </span>
          </div>
        )
      })()}

      {/* Avaliações */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>
          Avaliações {reviews.length > 0 && <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>({reviews.length})</span>}
        </h3>
      </div>

      {/* Form de avaliação — só mostra se tiver quoteId e usuário e evento aceito */}
      {quoteId && user && !alreadyReviewed && !submitted && (
        <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#166534', marginBottom: 4 }}>✍️ Deixe sua avaliação</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
            Sua avaliação ajuda outros usuários a escolherem melhor. Seja específico sobre sua experiência.
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            placeholder="Como foi a experiência? O espaço/serviço correspondeu ao anunciado? O anunciante foi atencioso?"
            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: text.length < 20 ? '#dc2626' : '#16a34a' }}>
              {text.length}/20 caracteres mínimos
            </span>
            {error && <span style={{ fontSize: 11, color: '#dc2626' }}>{error}</span>}
            <button onClick={submitReview} disabled={submitting || text.trim().length < 20}
              style={{ padding: '8px 18px', background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: text.trim().length < 20 ? 0.5 : 1 }}>
              {submitting ? 'Enviando...' : 'Publicar avaliação'}
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 10, padding: 14, marginBottom: 20, fontSize: 13, color: '#166534', fontWeight: 600 }}>
          ✅ Avaliação publicada! Obrigado por contribuir com a comunidade Ewind.
        </div>
      )}

      {/* Lista de avaliações */}
      {loading ? (
        <div style={{ color: '#9ca3af', fontSize: 13, padding: '20px 0' }}>Carregando avaliações...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px 16px', color: '#9ca3af', fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
          Ainda não há avaliações. Seja o primeiro a avaliar!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#1a2e05' }}>
                    {((r as any).profiles?.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2d2d2d' }}>
                      {(r as any).profiles?.full_name || 'Usuário verificado'}
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Cliente verificado pelo Ewind</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{fmt(r.created_at)}</div>
              </div>
              <p style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.65, margin: 0 }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
