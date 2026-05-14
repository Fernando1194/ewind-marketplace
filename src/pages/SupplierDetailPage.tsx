import AvailabilityCalendar from '../components/AvailabilityCalendar'
import Reviews from '../components/Reviews'
import { useState } from 'react'
import type { Supplier } from '../types'
import MediaCarousel from '../components/MediaCarousel'
import { SUPPLIER_CATEGORIES, EVENT_TYPES } from '../types'
import type { Page } from '../App'
import { supabase } from '../supabase'

interface Props {
  supplier: Supplier
  goToPage: (page: Page) => void
  user?: any
}

export default function SupplierDetailPage({ supplier, goToPage, user }: Props) {
  const cat = SUPPLIER_CATEGORIES.find(c => c.name === supplier.category)

  // Quote form state
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [eventType, setEventType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [guestsCount, setGuestsCount] = useState('')
  const [message, setMessage] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [quoteSuccess, setQuoteSuccess] = useState(false)
  const [waMsg, setWaMsg] = useState('')

  const handleWhatsApp = () => {
    if (!supplier.whatsapp) return
    const num = supplier.whatsapp.replace(/\D/g, '')
    const msg = encodeURIComponent(
      `Olá! Te encontrei na plataforma Ewind e gostaria de um orçamento do seu serviço de *${supplier.category}*. 🎉\n\n` +
      `Vi seu perfil como *${supplier.name}* na plataforma e adorei o trabalho!\n\n` +
      `Poderia me passar mais informações sobre disponibilidade e valores? 😊`
    )
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank')
  }

  const handleQuickWhatsApp = () => {
    if (!supplier.whatsapp) return
    const num = supplier.whatsapp.replace(/\D/g, '')
    const msg = encodeURIComponent(
      `Olá! Acabei de solicitar um orçamento pelo *Ewind* para o serviço *${supplier.name}*. 🎉\n\n` +
      `📌 *Serviço:* ${supplier.category}\n` +
      (eventType ? `🎉 *Evento:* ${eventType}\n` : '') +
      (eventDate ? `📅 *Data:* ${new Date(eventDate + 'T12:00:00').toLocaleDateString('pt-BR')}\n` : '') +
      (guestsCount ? `👥 *Convidados:* ${guestsCount} pessoas\n` : '') +
      (message ? `\n💬 *Obs:* ${message}\n` : '') +
      `\nMeu orçamento já foi enviado pela plataforma. Aguardo seu retorno! 😊`
    )
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank')
  }

  const submitQuote = async () => {
    if (!user) { goToPage('login'); return }
    if (!eventType || !eventDate) { setQuoteError('Preencha o tipo de evento e a data'); return }
    setQuoteLoading(true)
    setQuoteError('')
    try {
      const { error } = await supabase.from('quotes').insert({
        supplier_id: supplier.id,
        space_id: null,
        guest_id: user.id,
        host_id: supplier.owner_id,
        event_type: eventType,
        event_date: eventDate,
        event_time: eventTime || null,
        guests_count: guestsCount ? parseInt(guestsCount) : null,
        duration_hours: null,
        message: message || null,
        status: 'pending'
      })
      if (error) throw error
      setQuoteSuccess(true)
      // Build WhatsApp message for after success
      if (supplier.whatsapp) {
        const num = supplier.whatsapp.replace(/\D/g, '')
        const wm = encodeURIComponent(
          `Olá! Acabei de solicitar um orçamento pelo *Ewind* para o serviço *${supplier.name}*. 🎉\n\n` +
          `📌 *Serviço:* ${supplier.category}\n` +
          (eventType ? `🎉 *Evento:* ${eventType}\n` : '') +
          (eventDate ? `📅 *Data:* ${new Date(eventDate + 'T12:00:00').toLocaleDateString('pt-BR')}\n` : '') +
          (guestsCount ? `👥 *Convidados:* ${guestsCount} pessoas\n` : '') +
          (message ? `\n💬 *Obs:* ${message}\n` : '') +
          `\nMeu orçamento já foi enviado pela plataforma. Aguardo seu retorno! 😊`
        )
        setWaMsg(`https://wa.me/55${num}?text=${wm}`)
      }
    } catch (err: any) {
      setQuoteError(err.message || 'Erro ao enviar orçamento')
    }
    setQuoteLoading(false)
  }

  const handleInstagram = () => {
    if (!supplier.instagram) return
    const handle = supplier.instagram.replace('@', '')
    window.open(`https://instagram.com/${handle}`, '_blank')
  }

  return (
    <>
      <div className="back-bar">
        <a onClick={() => goToPage('suppliers')}>← Voltar aos fornecedores</a>
      </div>

      <div className="det-layout">
        <div>
          {/* Galeria */}
          <MediaCarousel urls={supplier.media_urls} alt={supplier.name} height={340} />

          {/* Badge categoria */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
            <span style={{
              background: cat?.bg || '#f0fdf4', fontSize: 13, fontWeight: 700,
              padding: '5px 14px', borderRadius: 20
            }}>
              {cat?.icon} {supplier.category}
            </span>
            {supplier.subcategory && (
              <span style={{ fontSize: 13, color: '#5aa800', fontWeight: 600 }}>
                · {supplier.subcategory}
              </span>
            )}
          </div>

          <h1 className="det-title">{supplier.name}</h1>
          <div className="det-loc">
            📍 {supplier.cities.join(', ')}, {supplier.state}
            {supplier.neighborhood && (
              <span style={{ marginLeft: 6, color: '#9ca3af' }}>· {supplier.neighborhood}</span>
            )}
          </div>

          {/* Stats */}
          <div className="stats-row" style={{ marginTop: 16 }}>
            <div className="stat-item">
              <div className="stat-val">{supplier.cities.length}</div>
              <div className="stat-lab">{supplier.cities.length === 1 ? 'Cidade' : 'Cidades'}</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">{supplier.event_types.length || '—'}</div>
              <div className="stat-lab">Tipos de evento</div>
            </div>
            <div className="stat-item">
              <div className="stat-val" style={{ color: '#5aa800' }}>Ativo</div>
              <div className="stat-lab">Status</div>
            </div>
          </div>

          {/* Descrição */}
          {supplier.description && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Sobre o serviço</h3>
              <p className="det-desc">{supplier.description}</p>
            </div>
          )}

          {/* Tipos de evento */}
          {supplier.event_types.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Tipos de evento atendidos</h3>
              <div className="card-tags">
                {supplier.event_types.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>
          )}

          {/* Atributos */}
          {supplier.attributes.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Diferenciais</h3>
              <div className="attrs">
                {supplier.attributes.map(a => (
                  <div key={a} className="attr">✓ {a}</div>
                ))}
              </div>
            </div>
          )}
        {/* Disponibilidade */}
        {((supplier as any).available_dates?.length > 0 || (supplier as any).availability_note) && (
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid #e8e8e8' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>📅 Disponibilidade</h3>
            <AvailabilityCalendar
              availableDates={(supplier as any).available_dates || []}
              readOnly
              availabilityNote={(supplier as any).availability_note}
            />
          </div>
        )}

        {/* Avaliações */}
        <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid #e8e8e8' }}>
          <Reviews supplierId={supplier.id} user={user} />
        </div>
        </div>

        {/* Sidebar contato */}
        <aside>
          <div className="quote-box">
            {supplier.price_info && (
              <>
                <div className="qb-price" style={{ fontSize: 18 }}>{supplier.price_info}</div>
                <div className="qb-sub">Valor orientativo · sujeito a negociação</div>
              </>
            )}

            {/* Quote form */}
            {!quoteSuccess ? (
              <>
                {!showQuoteForm ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                    <button onClick={() => user ? setShowQuoteForm(true) : goToPage('login')}
                      style={{ width: '100%', padding: 13, fontSize: 14, fontWeight: 700, background: '#a3e635', border: 'none', borderRadius: 8, color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit' }}>
                      📋 Solicitar orçamento pelo Ewind
                    </button>
                    {supplier.whatsapp && (
                      <button onClick={handleWhatsApp}
                        style={{ width: '100%', padding: 13, fontSize: 14, fontWeight: 700, background: '#25d366', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        💬 Contato rápido pelo WhatsApp
                      </button>
                    )}

              {supplier.instagram && (
                <button
                  onClick={handleInstagram}
                  style={{
                    width: '100%', padding: 13, fontSize: 14, fontWeight: 700,
                    background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                    border: 'none', borderRadius: 8,
                    color: '#fff', cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  📸 Ver Instagram
                </button>
              )}

              {supplier.email && (
                <a
                  href={`mailto:${supplier.email}`}
                  style={{
                    width: '100%', padding: 13, fontSize: 14, fontWeight: 700,
                    background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8,
                    color: '#2d2d2d', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  ✉️ Enviar email
                </a>
              )}

              {supplier.website && (
                <a
                  href={supplier.website.startsWith('http') ? supplier.website : `https://${supplier.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%', padding: 13, fontSize: 14, fontWeight: 700,
                    background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8,
                    color: '#2d2d2d', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                  }}
                >
                  🌐 Visitar site
                </a>
              )}

                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: '#2d2d2d' }}>📋 Solicitar orçamento</div>

                    <div className="fg" style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 12 }}>Tipo de evento *</label>
                      <select value={eventType} onChange={e => setEventType(e.target.value)}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
                        <option value="">Selecione...</option>
                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                      <div className="fg">
                        <label style={{ fontSize: 12 }}>Data *</label>
                        <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
                      </div>
                      <div className="fg">
                        <label style={{ fontSize: 12 }}>Horário</label>
                        <input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
                      </div>
                    </div>

                    <div className="fg" style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 12 }}>Nº de convidados</label>
                      <input type="text" inputMode="numeric" value={guestsCount}
                        onChange={e => setGuestsCount(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Ex: 100"
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }} />
                      <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
                        {[20,50,100,150,200,300].map(n => (
                          <button key={n} type="button" onClick={() => setGuestsCount(n.toString())}
                            style={{ padding: '2px 8px', fontSize: 10, fontWeight: 600, background: guestsCount === n.toString() ? '#a3e635' : '#f3f4f6', border: 'none', borderRadius: 100, cursor: 'pointer', color: guestsCount === n.toString() ? '#1a2e05' : '#6b7280' }}>
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="fg" style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12 }}>Mensagem (opcional)</label>
                      <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                        placeholder="Detalhes do evento, dúvidas..."
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                    </div>

                    {quoteError && <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 8, padding: '6px 10px', background: '#fef2f2', borderRadius: 6 }}>⚠️ {quoteError}</div>}

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setShowQuoteForm(false)}
                        style={{ flex: 1, padding: 10, fontSize: 13, fontWeight: 600, background: '#f9fafb', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                        Voltar
                      </button>
                      <button onClick={submitQuote} disabled={quoteLoading}
                        style={{ flex: 2, padding: 10, fontSize: 13, fontWeight: 700, background: '#a3e635', border: 'none', borderRadius: 8, color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {quoteLoading ? 'Enviando...' : '✓ Enviar orçamento'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ marginTop: 12, padding: 16, background: '#f0fdf4', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🎉</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 6 }}>Orçamento enviado!</div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 }}>
                  O fornecedor receberá seu pedido. Você pode acompanhar na aba Orçamentos.
                </p>
                {waMsg && (
                  <>
                    <a href={waMsg} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', width: '100%', padding: '10px', background: '#25d366', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 8 }}>
                      💬 Notificar pelo WhatsApp também
                    </a>
                    <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 8 }}>Acelera a resposta em até 3x</div>
                  </>
                )}
                <button onClick={() => goToPage('my-quotes')}
                  style={{ width: '100%', padding: 9, fontSize: 12, fontWeight: 700, background: '#111', border: 'none', borderRadius: 8, color: '#a3e635', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Ver meus orçamentos →
                </button>
              </div>
            )}

            {!quoteSuccess && !showQuoteForm && !supplier.whatsapp && !supplier.instagram && !supplier.email && !supplier.website && (
                <div style={{ textAlign: 'center', padding: 16, fontSize: 13, color: '#6b7280' }}>
                  Nenhum contato disponível
                </div>
              )}

            <div className="qb-sec" style={{ marginTop: 16 }}>
              🔒 Contrate com segurança. Verifique referências antes de fechar contrato.
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
