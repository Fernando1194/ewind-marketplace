import { t, type Lang } from '../translations'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page, space?: Space | any) => void
  lang?: Lang
}

const HERO_IMAGES = [
  // Casal dançando no casamento — momento mágico
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1600&h=800&fit=crop&q=90',
  // Noiva com buquê — sorriso e emoção
  'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1600&h=800&fit=crop&q=90',
  // Mesa de casamento decorada com flores e velas
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&h=800&fit=crop&q=90',
  // Festa de aniversário com confetes e celebração
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&h=800&fit=crop&q=90',
  // Fotógrafo capturando o momento perfeito
  'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1600&h=800&fit=crop&q=90',
  // Maquiagem artística — making of da noiva
  'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=1600&h=800&fit=crop&q=90',
  // Festa com luzes, música e alegria
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=800&fit=crop&q=90',
  // Convidados brindando e celebrando
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&h=800&fit=crop&q=90',
  // Bolo de casamento decorado com flores
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&h=800&fit=crop&q=85&auto=format',
]

export default function HomePage({ goToPage, lang = 'pt' }: Props) {
  const [filterCity, setFilterCity] = useState('')
  const [filterGuests, setFilterGuests] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [featuredSpaces, setFeaturedSpaces] = useState<Space[]>([])
  const [featuredSuppliers, setFeaturedSuppliers] = useState<any[]>([])
  const [heroImages] = useState<string[]>(HERO_IMAGES)
  const [currentHero, setCurrentHero] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    const [{ data: spacesData }, { data: suppData }] = await Promise.all([
      supabase
        .from('spaces')
        .select('id, name, city, state, category, media_urls, price_per_hour, price_per_day, capacity, event_types, host_id, min_hours, address, description, attributes, status, created_at, updated_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('suppliers')
        .select('id, owner_id, name, category, subcategory, state, cities, neighborhood, media_urls, price_info, description, attributes, event_types, whatsapp, email, instagram, website, facebook, youtube, tiktok, portfolio_url, status, created_at, updated_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)
    ])
    if (spacesData && spacesData.length > 0) setFeaturedSpaces(spacesData)
    if (suppData && suppData.length > 0) setFeaturedSuppliers(suppData)
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
      <section style={{ position: 'relative', minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', maxWidth: '100vw' }}>
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
            {t[lang].hero_badge}
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, maxWidth: 780, margin: '0 auto 16px', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            {t[lang].hero_title_1}{' '}
            <span style={{ color: '#a3e635' }}>{t[lang].hero_title_2}</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.7, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            {t[lang].hero_sub}
          </p>

          <div className="search-pill">
            <div className="sf">
              <div className="sf-label">{t[lang].hero_where}</div>
              <input placeholder={t[lang].hero_where_ph} value={filterCity} onChange={e => setFilterCity(e.target.value)} />
            </div>
            <div className="sf">
              <div className="sf-label">{t[lang].hero_date}</div>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{ colorScheme: 'light' }}
              />
            </div>
            <div className="sf">
              <div className="sf-label">{t[lang].hero_guests}</div>
              <input type="number" placeholder={t[lang].hero_guests_ph} value={filterGuests} onChange={e => setFilterGuests(e.target.value)} />
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
className="hero-arrow hero-arrow-left"
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 4, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={() => goToImage((currentHero + 1) % heroImages.length)}
className="hero-arrow hero-arrow-right"
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 4, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </>
        )}
      </section>

      {/* PROPOSTA DE VALOR */}
      <section style={{ background: '#f9fafb', padding: '32px 24px', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {[
            { icon: '🔍', title: 'Tudo em um só lugar', desc: 'Espaços, salões, chácaras, fotógrafos, DJs e decoradores — tudo aqui' },
            { icon: '💬', title: 'Orçamento em minutos', desc: 'Preencha os dados do evento e receba propostas diretamente do anunciante' },
            { icon: '💸', title: 'Grátis para quem busca', desc: 'Nenhuma taxa para quem organiza eventos' },
            { icon: '⚡', title: 'Resposta rápida', desc: 'Os melhores anunciantes respondem em até 24h — alguns em minutos' },
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
        <h2 className="sec-title">{t[lang].cat_title}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, overflowX: 'hidden' }}>
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
            <h2 className="sec-title" style={{ marginBottom: 0 }}>{t[lang].spaces_title}</h2>
            <button onClick={() => goToPage('listing')} style={{ fontSize: 13, fontWeight: 600, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Ver todos →
            </button>
          </div>
          <div className="cards-3col">
            {featuredSpaces.slice(0, 3).map(s => (
              <div key={s.id} className="card" onClick={() => goToPage('detail', s)}>
                <img src={s.media_urls[0] || 'https://via.placeholder.com/400x220?text=No+photo'} alt={s.name} loading="lazy" />
                <div className="card-body">
                  <div className="card-name">{s.name}</div>
                  <div className="card-loc">📍 {s.city}, {s.state}</div>
                  <div className="card-tags">
                    {s.event_types.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
                  </div>
                  <div className="card-foot">
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, display: 'block' }}>Preços a partir de</span>
                      <span className="card-price">{s.price_per_hour ? `R$ ${s.price_per_hour.toLocaleString('pt-BR')}` : s.price_per_day ? `R$ ${s.price_per_day.toLocaleString('pt-BR')}` : 'Consulte o valor'}</span>
                    </div>
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

      {/* FORNECEDORES EM DESTAQUE */}
      {featuredSuppliers.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>{t[lang].suppliers_title}</h2>
            <button onClick={() => goToPage('suppliers')} style={{ fontSize: 13, fontWeight: 600, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Ver todos →
            </button>
          </div>
          <div className="cards-3col">
            {featuredSuppliers.slice(0, 3).map(s => (
              <div key={s.id} className="card" onClick={() => goToPage('supplier-detail', s)}>
                {s.media_urls?.[0]
                  ? <img src={s.media_urls[0]} alt={s.name} loading="lazy" />
                  : <div style={{ height: 180, background: 'linear-gradient(135deg, #f0fdf4, #ecfccb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>🛠️</div>
                }
                <div className="card-body">
                  <div className="card-name">{s.name}</div>
                  <div className="card-loc">📍 {s.cities?.[0] || s.state} · {s.category}</div>
                  <div className="card-tags">
                    <span className="tag">🛠️ {lang === 'en' ? 'Supplier' : 'Fornecedor'}</span>
                    {s.whatsapp && <span className="tag">💬 WhatsApp</span>}
                  </div>
                  <div className="card-foot">
                    <div style={{ marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, display: 'block' }}>Preços a partir de</span>
                      <span className="card-price">{s.price_info ? (s.price_info.toLowerCase().includes('r$') ? s.price_info : `R$ ${s.price_info}`) : 'Consulte o valor'}</span>
                    </div>
                    <span className="card-cap">Ver perfil →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {featuredSuppliers.length === 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)', borderRadius: 16, padding: '40px 36px', textAlign: 'center', border: '1px solid #d9f99d' }}>
            <div style={{ fontSize: 38, marginBottom: 12 }}>🛠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#1a2e05' }}>Seja um dos primeiros fornecedores!</h3>
            <p style={{ fontSize: 13, color: '#365314', marginBottom: 18, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 18px' }}>
              Fotógrafos, DJs, decoradores e confeiteiros — cadastre seu serviço e comece a receber orçamentos.
            </p>
            <button className="btn-primary" style={{ padding: '11px 24px', fontSize: 14 }} onClick={() => goToPage('signup')}>
              Cadastrar meu serviço gratuitamente
            </button>
          </div>
        </section>
      )}

      {/* CTA HOST */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="cta-host">
          <div>
            <div className="cta-title">{t[lang].cta_host_title}</div>
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
        <span>{lang === 'en' ? '© 2025 Ewind — The event spaces & services marketplace' : '© 2025 Ewind — O marketplace de espaços e serviços para eventos'}</span>
      </footer>
    </>
  )
}
