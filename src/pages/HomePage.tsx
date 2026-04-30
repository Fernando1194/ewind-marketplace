import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page, space?: Space) => void
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1600&h=800&fit=crop&q=90',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&h=800&fit=crop&q=90',
]

export default function HomePage({ goToPage }: Props) {
  const [filterCity, setFilterCity] = useState('')
  const [filterGuests, setFilterGuests] = useState('')
  const [featuredSpaces, setFeaturedSpaces] = useState<Space[]>([])
  const [heroImages] = useState<string[]>(HERO_IMAGES)
  const [currentHero, setCurrentHero] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('id, name, city, state, category, media_urls, price_per_hour, price_per_day, capacity, event_types, host_id, min_hours, address, description, attributes, status, created_at, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6)
    if (data && data.length > 0) setFeaturedSpaces(data)
  }

  useEffect(() => {
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => { setCurrentHero(i => (i + 1) % heroImages.length); setFadeIn(true) }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroImages])

  const goToImage = useCallback((i: number) => {
    setFadeIn(false)
    setTimeout(() => { setCurrentHero(i); setFadeIn(true) }, 300)
  }, [])

  return (
    <>
      {/* HERO */}
      <section style={{ position: 'relative', minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {heroImages.map((img, i) => (
          <div key={img} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: i === currentHero ? (fadeIn ? 1 : 0) : 0,
            transition: 'opacity 0.8s ease-in-out', zIndex: i === currentHero ? 1 : 0
          }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.65) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 3, padding: '60px 24px', width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a3e635', marginBottom: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            O marketplace de eventos do Brasil
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, maxWidth: 780, margin: '0 auto 16px', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            Seu evento merece o{' '}
            <span style={{ color: '#a3e635' }}>espaço perfeito</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.7, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            Compare chácaras, salões, hotéis, restaurantes e muito mais. Solicite orçamentos diretamente com os anunciantes — grátis e sem compromisso.
          </p>

          <div className="search-pill">
            <div className="sf">
              <div className="sf-label">Onde</div>
              <input placeholder="Cidade ou região" value={filterCity} onChange={e => setFilterCity(e.target.value)} />
            </div>
            <div className="sf">
              <div className="sf-label">Convidados</div>
              <input type="number" placeholder="Quantidade" value={filterGuests} onChange={e => setFilterGuests(e.target.value)} />
            </div>
            <button className="search-btn" onClick={() => goToPage('listing')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>

          {heroImages.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {heroImages.map((_, i) => (
                <button key={i} onClick={() => goToImage(i)} style={{
                  width: i === currentHero ? 24 : 8, height: 8, borderRadius: 100,
                  background: i === currentHero ? '#a3e635' : 'rgba(255,255,255,0.5)',
                  border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s', flexShrink: 0
                }} />
              ))}
            </div>
          )}
        </div>

        {heroImages.length > 1 && (
          <>
            <button onClick={() => goToImage((currentHero - 1 + heroImages.length) % heroImages.length)}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 4, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={() => goToImage((currentHero + 1) % heroImages.length)}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 4, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </>
        )}
      </section>

      {/* PROPOSTA DE VALOR */}
      <section style={{ background: '#f9fafb', padding: '32px 24px', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {[
            { icon: '🔍', title: 'Compare opções', desc: 'Veja vários espaços lado a lado antes de decidir' },
            { icon: '💬', title: 'Orçamento direto', desc: 'Fale diretamente com o anunciante, sem intermediários' },
            { icon: '💸', title: '100% gratuito', desc: 'Nenhuma taxa para quem busca um espaço' },
            { icon: '⚡', title: 'Resposta rápida', desc: 'Anunciantes respondem em até 24 horas' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="section">
        <h2 className="sec-title">Explore por categoria</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {CATEGORIES.map(c => (
            <div key={c.name} onClick={() => goToPage('listing')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 12, border: '1.5px solid #e8e8e8', cursor: 'pointer', background: '#fff', transition: 'all 0.2s', textAlign: 'center' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#a3e635'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 4px 12px rgba(163,230,53,0.15)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8e8e8'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{c.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#2d2d2d', lineHeight: 1.3 }}>{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ESPAÇOS EM DESTAQUE */}
      {featuredSpaces.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>Espaços em destaque</h2>
            <button onClick={() => goToPage('listing')} style={{ fontSize: 13, fontWeight: 600, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Ver todos →
            </button>
          </div>
          <div className="cards-3col">
            {featuredSpaces.slice(0, 3).map(s => (
              <div key={s.id} className="card" onClick={() => goToPage('detail', s)}>
                <img src={s.media_urls[0] || 'https://via.placeholder.com/400x220?text=Sem+foto'} alt={s.name} loading="lazy" />
                <div className="card-body">
                  <div className="card-name">{s.name}</div>
                  <div className="card-loc">📍 {s.city}, {s.state}</div>
                  <div className="card-tags">
                    {s.event_types.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <div className="card-foot">
                    <span className="card-price">{s.price_per_hour ? `R$${s.price_per_hour}/h` : `R$${s.price_per_day}/dia`}</span>
                    <span className="card-cap">👥 até {s.capacity}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {featuredSpaces.length === 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)', borderRadius: 16, padding: '48px 40px', textAlign: 'center', border: '1px solid #d9f99d' }}>
            <div style={{ fontSize: 42, marginBottom: 14 }}>🎪</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#1a2e05' }}>Seja um dos primeiros anunciantes!</h3>
            <p style={{ fontSize: 14, color: '#365314', marginBottom: 20, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 20px' }}>
              Estamos recebendo os primeiros cadastros de espaços. Garanta visibilidade desde o início e comece a receber orçamentos.
            </p>
            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }} onClick={() => goToPage('signup')}>
              Cadastrar meu espaço gratuitamente
            </button>
          </div>
        </section>
      )}

      {/* CTA HOST */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="cta-host">
          <div>
            <div className="cta-title">Tem um espaço para eventos?</div>
            <div className="cta-desc">
              Cadastre seu espaço no Ewind e receba solicitações de orçamento qualificadas — com data, número de convidados e tipo de evento já informados. Grátis para começar.
            </div>
          </div>
          <button className="btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => goToPage('signup')}>
            Anunciar meu espaço →
          </button>
        </div>
      </section>

      {/* CTA FORNECEDOR */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', borderRadius: 16, padding: '36px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 48 }}>🛠️</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#a3e635', marginBottom: 8 }}>
                Você é fotógrafo, DJ, cerimonialista, buffet ou fornecedor de serviços?
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 500, lineHeight: 1.7 }}>
                Crie seu perfil profissional no Ewind, exiba seu portfólio e seja encontrado por quem está organizando o evento perfeito. Sem custo.
              </div>
            </div>
          </div>
          <button
            style={{ padding: '14px 28px', fontSize: 15, fontWeight: 700, background: '#a3e635', border: 'none', borderRadius: 10, color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => goToPage('supplier-signup')}
          >
            Sou fornecedor →
          </button>
        </div>
      </section>

      <footer className="footer">
        <img src="/logo.png" alt="Ewind" className="logo-img-sm" />
        <span>© 2025 Ewind — O marketplace de espaços e serviços para eventos</span>
      </footer>
    </>
  )
}
