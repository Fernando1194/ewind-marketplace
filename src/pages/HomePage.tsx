import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page, space?: Space) => void
}

// Imagens curadas de alta qualidade para o hero (Unsplash)
const HERO_IMAGES = [
  // Salão de festas luxuoso
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&h=800&fit=crop&q=90',
  // Casamento ao ar livre elegante
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&h=800&fit=crop&q=90',
  // Chácara / espaço externo
  'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1600&h=800&fit=crop&q=90',
  // Mesa de banquete decorada
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&h=800&fit=crop&q=90',
  // Salão corporativo moderno
  'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1600&h=800&fit=crop&q=90',
  // Festa ao ar livre iluminada
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1600&h=800&fit=crop&q=90',
  // Pousada / espaço rústico
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&h=800&fit=crop&q=90',
]

export default function HomePage({ goToPage }: Props) {
  const [filterCity, setFilterCity] = useState('')
  const [filterGuests, setFilterGuests] = useState('')
  const [featuredSpaces, setFeaturedSpaces] = useState<Space[]>([])
  const [heroImages] = useState<string[]>(HERO_IMAGES)
  const [currentHero, setCurrentHero] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('id, name, city, state, category, media_urls, price_per_hour, price_per_day, capacity, event_types, host_id, min_hours, address, description, attributes, status, created_at, updated_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(6)

    if (data && data.length > 0) {
      setFeaturedSpaces(data)
    }
  }

  // Slideshow automático com fade
  useEffect(() => {
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentHero(i => (i + 1) % heroImages.length)
        setFadeIn(true)
      }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroImages])

  const goToImage = useCallback((i: number) => {
    setFadeIn(false)
    setTimeout(() => { setCurrentHero(i); setFadeIn(true) }, 300)
  }, [])

  return (
    <>
      {/* HERO com slideshow */}
      <section style={{ position: 'relative', minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* Imagens do slideshow em camadas */}
        {heroImages.map((img, i) => (
          <div
            key={img}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: i === currentHero ? (fadeIn ? 1 : 0) : 0,
              transition: 'opacity 0.8s ease-in-out',
              zIndex: i === currentHero ? 1 : 0
            }}
          />
        ))}

        {/* Overlay escuro */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.6) 100%)'
        }} />

        {/* Conteúdo do hero */}
        <div style={{ position: 'relative', zIndex: 3, padding: '60px 24px', width: '100%', textAlign: 'center' }}>
          <h1 style={{
            fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1,
            marginBottom: 16, maxWidth: 780, margin: '0 auto 16px',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)'
          }}>
            Compare espaços e solicite{' '}
            <span style={{ color: '#a3e635' }}>orçamentos</span>
          </h1>
          <p style={{
            fontSize: 17, color: 'rgba(255,255,255,0.9)', maxWidth: 560,
            margin: '0 auto 36px', lineHeight: 1.6,
            textShadow: '0 1px 8px rgba(0,0,0,0.5)'
          }}>
            Descubra chácaras, salões, hotéis e muito mais para seu evento. Compare e peça orçamentos de forma gratuita.
          </p>

          {/* Search pill */}
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>

          {/* Dots do slideshow */}
          {heroImages.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {heroImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToImage(i)}
                  style={{
                    width: i === currentHero ? 24 : 8, height: 8, borderRadius: 100,
                    background: i === currentHero ? '#a3e635' : 'rgba(255,255,255,0.5)',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 0.3s', flexShrink: 0
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Setas do slideshow */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={() => goToImage((currentHero - 1 + heroImages.length) % heroImages.length)}
              style={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                zIndex: 4, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
                fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >‹</button>
            <button
              onClick={() => goToImage((currentHero + 1) % heroImages.length)}
              style={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                zIndex: 4, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
                width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
                fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
            >›</button>
          </>
        )}
      </section>

      {/* CATEGORIAS */}
      <section className="section">
        <h2 className="sec-title">Explore por categoria</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {CATEGORIES.map(c => (
            <div
              key={c.name}
              onClick={() => goToPage('listing')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 8, padding: '16px 8px', borderRadius: 12,
                border: '1.5px solid #e8e8e8', cursor: 'pointer',
                background: '#fff', transition: 'all 0.2s', textAlign: 'center'
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#a3e635'
                el.style.transform = 'translateY(-2px)'
                el.style.boxShadow = '0 4px 12px rgba(163,230,53,0.15)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = '#e8e8e8'
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = 'none'
              }}
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
          <h2 className="sec-title">Espaços em destaque</h2>
          <div className="cards-3col">
            {featuredSpaces.slice(0, 3).map(s => (
              <div key={s.id} className="card" onClick={() => goToPage('detail', s)}>
                <img
                  src={s.media_urls[0] || 'https://via.placeholder.com/400x220?text=Sem+foto'}
                  alt={s.name}
                  loading="lazy"
                />
                <div className="card-body">
                  <div className="card-name">{s.name}</div>
                  <div className="card-loc">📍 {s.city}, {s.state}</div>
                  <div className="card-tags">
                    {s.event_types.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <div className="card-foot">
                    <span className="card-price">
                      {s.price_per_hour ? `R$${s.price_per_hour}/h` : `R$${s.price_per_day}/dia`}
                    </span>
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
          <div style={{ background: '#f9fafb', borderRadius: 14, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Em breve, espaços incríveis!</h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Estamos recebendo os primeiros cadastros. Quer ser um dos primeiros?</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => goToPage('signup')}>
              Cadastrar meu espaço
            </button>
          </div>
        </section>
      )}

      {/* CTA HOST */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="cta-host">
          <div>
            <div className="cta-title">Tem um espaço para eventos?</div>
            <div className="cta-desc">Anuncie no Ewind e receba solicitações de orçamento de clientes que buscam exatamente o que você oferece.</div>
          </div>
          <button className="btn-primary" onClick={() => goToPage('signup')}>Cadastrar meu espaço →</button>
        </div>
      </section>

      {/* CTA FORNECEDOR */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          borderRadius: 16, padding: '36px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 24, flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ fontSize: 48 }}>🛠️</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#a3e635', marginBottom: 8 }}>
                É fotógrafo, DJ, decorador ou fornecedor de serviços?
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', maxWidth: 480, lineHeight: 1.6 }}>
                Crie seu perfil na área exclusiva de fornecedores, monte seu portfólio e conecte-se com quem está organizando eventos.
              </div>
            </div>
          </div>
          <button
            style={{
              padding: '14px 28px', fontSize: 15, fontWeight: 700,
              background: '#a3e635', border: 'none', borderRadius: 10,
              color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit',
              whiteSpace: 'nowrap', flexShrink: 0
            }}
            onClick={() => goToPage('supplier-signup')}
          >
            Sou fornecedor →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="logo-box-sm">EWIND</div>
        <span>© 2025 Ewind — Marketplace de Espaços para Eventos</span>
      </footer>
    </>
  )
}
