import { useState } from 'react'
import { supabase } from '../supabase'
import MediaCarousel from '../components/MediaCarousel'
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
  const [eventTime, setEventTime] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [whatsappSent, setWhatsappSent] = useState(false)

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
        event_time: eventTime || null,
        guests_count: parseInt(guestsCount),
        duration_hours: parseInt(duration),
        message: message || null,
        status: 'pending'
      })

      if (insertError) throw insertError

      setSuccess(true)
      setShowForm(false)
      setQuoteData({ eventType, eventDate, eventTime, guestsCount, duration, message })
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
          <MediaCarousel urls={space.media_urls} alt={space.name} height={380} />
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
          {/* Metragem */}
          {(space.area_covered || space.area_uncovered) && (
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              {space.area_covered && (
                <div style={{ background: '#f0fdf4', border: '1px solid #d9f99d', borderRadius: 10, padding: '12px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>🏠</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{space.area_covered} m²</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Área coberta</div>
                </div>
              )}
              {space.area_uncovered && (
                <div style={{ background: '#f0fdf4', border: '1px solid #d9f99d', borderRadius: 10, padding: '12px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>🌤️</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{space.area_uncovered} m²</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Área descoberta</div>
                </div>
              )}
            </div>
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

          {/* Mapa */}
          {(space.address || space.neighborhood || space.city) && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>📍 Localização</h3>
              {space.neighborhood && (
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                  Bairro: <strong>{space.neighborhood}</strong> · {space.city}, {space.state}
                </p>
              )}
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e8e8e8' }}>
                <iframe
                  title="Mapa do espaço"
                  width="100%"
                  height="280"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    [space.address, space.neighborhood, space.city, space.state, 'Brasil']
                      .filter(Boolean).join(', ')
                  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                📌 Endereço completo compartilhado após confirmação do orçamento.
              </p>
            </div>
          )}
        </div>

        <aside>
          <div className="quote-box">
            <div className="qb-price">
              {space.price_per_hour ? `R$ ${space.price_per_hour}/hora` : `R$ ${space.price_per_day}/dia`}
            </div>
            <div className="qb-sub">Preço orientativo · sujeito a negociação</div>

            {success && quoteData && (() => {
              const waNumber = space.whatsapp ? `55${space.whatsapp.replace(/\D/g, '')}` : null
              const waMsg = encodeURIComponent(
                `Olá! Te encontrei na plataforma Ewind e gostaria de um orçamento do seu espaço *${space.name}*. 🎉\n\n` +
                `📌 *Evento:* ${quoteData.eventType}\n` +
                `📅 *Data:* ${new Date(quoteData.eventDate).toLocaleDateString('pt-BR')}${quoteData.eventTime ? ` às ${quoteData.eventTime.substring(0,5)}` : ''}\n` +
                `👥 *Convidados:* ${quoteData.guestsCount} pessoas\n` +
                `⏱️ *Duração:* ${quoteData.duration}h\n` +
                (quoteData.message ? `\n💬 *Obs:* ${quoteData.message}\n` : '') +
                `\nAguardo retorno! 😊`
              )
              return (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: 18, textAlign: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#14532d', marginBottom: 4 }}>Orçamento enviado!</div>
                  <div style={{ fontSize: 12, color: '#166534', marginBottom: 14, lineHeight: 1.5 }}>
                    Você receberá a resposta no painel em até 24h.<br/>
                    <strong>Acelere o processo enviando também pelo WhatsApp!</strong>
                  </div>

                  {waNumber && !whatsappSent ? (
                    <>
                      <div style={{ background: '#fff', border: '1px solid #d9f99d', borderRadius: 10, padding: '10px 12px', marginBottom: 12, textAlign: 'left', fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
                        <div style={{ fontWeight: 700, color: '#166534', marginBottom: 6 }}>📱 Mensagem que será enviada:</div>
                        <div style={{ fontStyle: 'italic', color: '#6b7280' }}>
                          "Olá! Te encontrei na plataforma Ewind e gostaria de um orçamento do seu espaço <strong>{space.name}</strong>."
                          <br/>📌 {quoteData.eventType} · 📅 {new Date(quoteData.eventDate).toLocaleDateString('pt-BR')}{quoteData.eventTime ? ` às ${quoteData.eventTime.substring(0,5)}` : ''}
                          <br/>👥 {quoteData.guestsCount} pessoas · ⏱️ {quoteData.duration}h
                        </div>
                      </div>
                      <a
                        href={`https://wa.me/${waNumber}?text=${waMsg}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setWhatsappSent(true)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          background: '#25D366', color: '#fff', padding: '11px 16px',
                          borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none',
                          marginBottom: 10
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Enviar mensagem pelo WhatsApp
                      </a>
                      <button onClick={() => setWhatsappSent(true)} style={{ fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Pular, só aguardar na plataforma
                      </button>
                    </>
                  ) : (
                    <>
                      {whatsappSent && (
                        <div style={{ fontSize: 12, color: '#166534', marginBottom: 10 }}>
                          ✓ Mensagem enviada! Aguarde o retorno.
                        </div>
                      )}
                      {!waNumber && (
                        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 8 }}>
                          Este espaço ainda não tem WhatsApp cadastrado.<br/>Aguarde a resposta pela plataforma.
                        </div>
                      )}
                      <button onClick={() => goToPage('my-quotes')} className="btn-primary" style={{ width: '100%', padding: 11, fontSize: 13 }}>
                        Ver meus orçamentos →
                      </button>
                    </>
                  )}
                </div>
              )
            })()}

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
                <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>⚡</span>
                  <span>Anunciantes respondem em até <strong>24 horas</strong>. Você receberá a proposta diretamente no painel.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </form>
            )}

            {/* Links do espaço */}
            {(space.whatsapp || space.instagram || space.facebook || space.website || space.cardapio_url) && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#2d2d2d', marginBottom: 4 }}>🔗 Links e contatos</div>
                {space.whatsapp && (
                  <a href={`https://wa.me/55${space.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Te encontrei na plataforma Ewind e gostaria de um orçamento do seu espaço *' + space.name + '*. Poderia me passar mais informações sobre disponibilidade e valores? 😊')}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#f0fdf4', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#166534', textDecoration: 'none' }}>
                    💬 WhatsApp
                  </a>
                )}
                {space.instagram && (
                  <a href={`https://instagram.com/${space.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#fdf4ff', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#6b21a8', textDecoration: 'none' }}>
                    📸 Instagram
                  </a>
                )}
                {space.facebook && (
                  <a href={space.facebook.startsWith('http') ? space.facebook : `https://${space.facebook}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#eff6ff', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1d4ed8', textDecoration: 'none' }}>
                    📘 Facebook
                  </a>
                )}
                {space.website && (
                  <a href={space.website.startsWith('http') ? space.website : `https://${space.website}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#2d2d2d', textDecoration: 'none' }}>
                    🌐 Site próprio
                  </a>
                )}
                {space.cardapio_url && (
                  <a href={space.cardapio_url.startsWith('http') ? space.cardapio_url : `https://${space.cardapio_url}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#fff7ed', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#c05621', textDecoration: 'none' }}>
                    🍽️ Ver cardápio
                  </a>
                )}
              </div>
            )}
            <div className="qb-sec">🔒 Seus dados são protegidos. Compartilhados apenas com o fornecedor.</div>
          </div>
        </aside>
      </div>
    </>
  )
}
