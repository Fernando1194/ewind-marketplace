import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page, space?: Space) => void
}

export default function HomePage({ goToPage }: Props) {
  const [filterCity, setFilterCity] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterGuests, setFilterGuests] = useState('')
  const [featuredSpaces, setFeaturedSpaces] = useState<Space[]>([])

  useEffect(() => {
    loadFeaturedSpaces()
  }, [])

  const loadFeaturedSpaces = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3)

    if (data && data.length > 0) {
      setFeaturedSpaces(data)
    }
  }

  return (
    <>
      <section className="hero">
        <img className="hero-bg" src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1400&h=600&fit=crop&q=80" alt="" />
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Compare espaços e solicite <span>orçamentos</span></h1>
          <p>Descubra chácaras, salões, restaurantes e pousadas ideais para seu evento. Compare opções e peça orçamentos de forma rápida e gratuita.</p>
          <div className="search-pill">
            <div className="sf">
              <div className="sf-label">Onde</div>
              <input placeholder="Cidade ou região" value={filterCity} onChange={e => setFilterCity(e.target.value)} />
            </div>
            <div className="sf">
              <div className="sf-label">Quando</div>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
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
        </div>
      </section>

      <section className="section">
        <h2 className="sec-title">Explore por categoria</h2>
        <div className="cat-grid">
          {CATEGORIES.map(c => (
            <div key={c.name} className="cat-card" onClick={() => goToPage('listing')}>
              <div className="cat-icon" style={{ background: c.bg }}>{c.icon}</div>
              <div className="cat-name">{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {featuredSpaces.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <h2 className="sec-title">Espaços em destaque</h2>
          <div className="cards-3col">
            {featuredSpaces.map(s => (
              <div key={s.id} className="card" onClick={() => goToPage('detail', s)}>
                <img src={s.media_urls[0] || 'https://via.placeholder.com/400x220?text=Sem+foto'} alt={s.name} />
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
            <p style={{ fontSize: 14, color: '#6b7280' }}>Estamos aceitando os primeiros cadastros. Quer ser um dos primeiros?</p>
            <button className="btn-primary" style={{ marginTop: 16 }} onClick={() => goToPage('signup')}>
              Cadastrar meu espaço
            </button>
          </div>
        </section>
      )}

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
                Crie seu perfil na área exclusiva de fornecedores do Ewind, monte seu portfólio e conecte-se com quem está organizando eventos.
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

      <footer className="footer">
        <div className="logo-box-sm">EWIND</div>
        <span>© 2025 Ewind — Marketplace de Espaços para Eventos</span>
      </footer>
    </>
  )
}
