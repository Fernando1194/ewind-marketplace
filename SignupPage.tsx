import { useState } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Space } from '../types'
import { EVENT_TYPES } from '../types'
import type { Page } from '../App'

interface Props {
  space: Space
  user: User | null
  goToPage: (page: Page) => void
}

export default function DetailPage({ space, user, goToPage }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [eventType, setEventType] = useState(space.event_types[0] || 'Casamento')
  const [eventDate, setEventDate] = useState('')
  const [guestsCount, setGuestsCount] = useState('')
  const [duration, setDuration] = useState('4')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user) {
      goToPage('login')
      return
    }

    if (parseInt(guestsCount) > space.capacity) {
      setError(`Este espaço comporta no máximo ${space.capacity} pessoas`)
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase.from('quotes').insert({
        space_id: space.id,
        guest_id: user.id,
        host_id: space.host_id,
        event_type: eventType,
        event_date: eventDate,
        guests_count: parseInt(guestsCount),
        duration_hours: parseInt(duration),
        message: message || null,
        status: 'pending'
      })

      if (insertError) throw insertError

      setSuccess(true)
      setShowForm(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar orçamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="back-bar">
        <a onClick={() => goToPage('listing')}>← Voltar à listagem</a>
      </div>
      <div className="det-layout">
        <div>
          <img
            src={space.media_urls[0] || 'https://via.placeholder.com/800x450?text=Sem+foto'}
            className="det-main-img"
            alt={space.name}
          />
          {space.media_urls.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 18, overflowX: 'auto' }}>
              {space.media_urls.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8 }} />
              ))}
            </div>
          )}
          <div className="card-tags" style={{ marginBottom: 10 }}>
            {space.event_types.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <h1 className="det-title">{space.name}</h1>
          <div className="det-loc">📍 {space.city}, {space.state} · {space.category}</div>
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-val">{space.capacity}</div>
              <div className="stat-lab">Capacidade</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">{space.min_hours}h</div>
              <div className="stat-lab">Mínimo</div>
            </div>
            <div className="stat-item">
              <div className="stat-val" style={{ color: '#5aa800' }}>Ativo</div>
              <div className="stat-lab">Status</div>
            </div>
          </div>
          {space.description && (
            <p className="det-desc" style={{ marginTop: 16 }}>
              {space.description}
            </p>
          )}
          {space.attributes.length > 0 && (
            <>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, marginTop: 20 }}>O que o local oferece</h3>
              <div className="attrs">
                {space.attributes.map(a => (
                  <div key={a} className="attr">✓ {a}</div>
                ))}
              </div>
            </>
          )}
        </div>

        <aside>
          <div className="quote-box">
            <div className="qb-price">
              {space.price_per_hour ? `R$ ${space.price_per_hour}/hora` : `R$ ${space.price_per_day}/dia`}
            </div>
            <div className="qb-sub">Preço orientativo · sujeito a negociação</div>

            {success && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 16, textAlign: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>Orçamento enviado!</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>O fornecedor responderá em breve</div>
                <button
                  onClick={() => goToPage('my-quotes')}
                  style={{ marginTop: 12, fontSize: 13, color: '#5aa800', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Ver meus orçamentos →
                </button>
              </div>
            )}

            {!success && !showForm && (
              <button
                className="btn-primary"
                style={{ width: '100%', padding: 13 }}
                onClick={() => user ? setShowForm(true) : goToPage('login')}
              >
                {user ? 'Solicitar orçamento' : 'Entre para solicitar'}
              </button>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Tipo de evento *</label>
                  <select
                    value={eventType}
                    onChange={e => setEventType(e.target.value)}
                    required
                    style={{ width: '100%', padding: 9, border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
                  >
                    {space.event_types.map(t => <option key={t} value={t}>{t}</option>)}
                    {EVENT_TYPES.filter(t => !space.event_types.includes(t)).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Data do evento *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: 9, border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Convidados *</label>
                  <input
                    type="number"
                    value={guestsCount}
                    onChange={e => setGuestsCount(e.target.value)}
                    required
                    min={1}
                    max={space.capacity}
                    placeholder={`Máx: ${space.capacity}`}
                    style={{ width: '100%', padding: 9, border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Duração (horas)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    min={space.min_hours}
                    placeholder={`Mín: ${space.min_hours}h`}
                    style={{ width: '100%', padding: 9, border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Mensagem (opcional)</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Conte mais sobre seu evento..."
                    style={{ width: '100%', padding: 9, border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }}
                  />
                </div>
                {error && <div className="auth-error">⚠️ {error}</div>}
                <button type="submit" className="btn-primary" style={{ padding: 11 }} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar solicitação'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </form>
            )}

            <div className="qb-sec">🔒 Seus dados são protegidos. Compartilhados apenas com o fornecedor.</div>
          </div>
        </aside>
      </div>
    </>
  )
}
