import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'
import { useCopy } from '../i18n'
import { HOME } from '../i18n/home'

interface Props {
  goToPage: (page: Page, space?: Space) => void
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

export default function HomePage({ goToPage }: Props) {
  const c = useCopy(HOME)
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
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('suppliers')
        .select('*')
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
            {c.badge}
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16, maxWidth: 820, margin: '0 auto 16px', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            {c.h1a}{' '}
            <span style={{ color: '#a3e635' }}>{c.h1b}</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.9)', maxWidth: 600, margin: '0 auto 36px', lineHeight: 1.7, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
            {c.lead}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
            <button className="btn-primary" onClick={() => goToPage('events')} style={{ fontSize: 16, padding: '15px 36px', fontWeight: 700 }}>
              {c.ctaEvent}
            </button>
            <button onClick={() => goToPage('how-it-works')} style={{ fontSize: 16, padding: '15px 28px', fontWeight: 600, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}>
              {c.how}
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

      {/* PROPOSTA DE VALOR — 4 pilares */}
      <section style={{ background: '#f9fafb', padding: '40px 24px', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {c.pillars.map((item, i) => (
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

      {/* COMO FUNCIONA — 3 passos (única seção) */}
      <section className="section">
        <h2 className="sec-title">{c.stepsTitle}</h2>
        <p style={{ textAlign: 'center', fontSize: 15, color: '#6b7280', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
          {c.stepsLead}
        </p>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {c.steps.map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 16, padding: 24, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, right: 20, fontSize: 32, fontWeight: 900, color: '#f0fdf4' }}>{s.n}</div>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <button className="btn-primary" onClick={() => goToPage('events')} style={{ fontSize: 16, padding: '14px 36px', fontWeight: 700 }}>
            {c.startNow}
          </button>
        </div>
      </section>

      {/* MARKETPLACE — EARLY ADOPTER (única faixa) */}
      <section className="section" style={{ background: '#f9fafb', borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: '#1a2e05', background: '#a3e635', padding: '4px 12px', borderRadius: 100, marginBottom: 14 }}>{c.ea}</span>
          <h2 className="sec-title" style={{ marginBottom: 12 }}>{c.eaTitle}</h2>
          <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 620, margin: '0 auto 8px', lineHeight: 1.7 }}>
            {c.eaP1}
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>
            {c.eaP2}
          </p>
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="section">
        <h2 className="sec-title">{c.explore}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, overflowX: 'hidden' }}>
          {CATEGORIES.map(cat => (
            <div key={cat.name} onClick={() => goToPage('listing')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 8px', borderRadius: 12, border: '1.5px solid #e8e8e8', cursor: 'pointer', background: '#fff', transition: 'all 0.2s', textAlign: 'center' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#a3e635'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 4px 12px rgba(163,230,53,0.15)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#e8e8e8'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none' }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{cat.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#2d2d2d', lineHeight: 1.3 }}>{c.cats[cat.name] || cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ESPAÇOS EM DESTAQUE */}
      {featuredSpaces.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>{c.featSpaces}</h2>
            <button onClick={() => goToPage('listing')} style={{ fontSize: 13, fontWeight: 600, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {c.seeAll}
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
                    <span className="card-price">{s.price_per_hour ? `R$${s.price_per_hour}/h` : `R$${s.price_per_day}${c.perDay}`}</span>
                    <span className="card-cap">👥 {c.upTo} {s.capacity}</span>
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
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#1a2e05' }}>{c.firstHostsTitle}</h3>
            <p style={{ fontSize: 14, color: '#365314', marginBottom: 20, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 20px' }}>
              {c.firstHostsP}
            </p>
            <button className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }} onClick={() => goToPage('signup')}>
              {c.firstHostsBtn}
            </button>
          </div>
        </section>
      )}

      {/* FORNECEDORES EM DESTAQUE */}
      {featuredSuppliers.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2 className="sec-title" style={{ marginBottom: 0 }}>{c.featSuppliers}</h2>
            <button onClick={() => goToPage('suppliers')} style={{ fontSize: 13, fontWeight: 600, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {c.seeAll}
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
                    <span className="tag">🛠️ {c.supplier}</span>
                    {s.whatsapp && <span className="tag">💬 WhatsApp</span>}
                  </div>
                  <div className="card-foot">
                    <span className="card-price">{s.price_info
                      ? (isNaN(Number(s.price_info.replace(/[^0-9.,]/g, ''))) || !s.price_info.trim()
                          ? s.price_info
                          : s.price_info.toLowerCase().includes('r$')
                            ? s.price_info
                            : `R$ ${s.price_info}`)
                      : c.askPrice}</span>
                    <span className="card-cap">{c.viewProfile}</span>
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
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#1a2e05' }}>{c.firstSuppTitle}</h3>
            <p style={{ fontSize: 13, color: '#365314', marginBottom: 18, lineHeight: 1.6, maxWidth: 420, margin: '0 auto 18px' }}>
              {c.firstSuppP}
            </p>
            <button className="btn-primary" style={{ padding: '11px 24px', fontSize: 14 }} onClick={() => goToPage('signup')}>
              {c.firstSuppBtn}
            </button>
          </div>
        </section>
      )}

      {/* CTA HOST */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="cta-host">
          <div>
            <div className="cta-title">{c.ctaHostTitle}</div>
            <div className="cta-desc">
              {c.ctaHostDesc}
            </div>
          </div>
          <button className="btn-primary" style={{ whiteSpace: 'nowrap' }} onClick={() => goToPage('signup')}>
            {c.ctaHostBtn}
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
                {c.ctaSuppTitle}
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 540, lineHeight: 1.7 }}>
                {c.ctaSuppDescA} <strong>{c.ctaSuppAnd}</strong> {c.ctaSuppDescB}
              </div>
            </div>
          </div>
          <button
            style={{ padding: '14px 28px', fontSize: 15, fontWeight: 700, background: '#a3e635', border: 'none', borderRadius: 10, color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => goToPage('signup')}
          >
            {c.ctaSuppBtn}
          </button>
        </div>
      </section>

      <footer className="footer">
        <img src="/logo.png" alt="Ewind" className="logo-img-sm" />
        <span>{c.footer}</span>
      </footer>
    </>
  )
}
