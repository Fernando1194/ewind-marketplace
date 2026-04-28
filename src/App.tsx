import { useState } from 'react'
import './App.css'

interface Space {
  id: number
  name: string
  city: string
  category: string
  types: string[]
  price: number
  priceUnit: string
  capacity: number
  image: string
  attributes: string[]
}

const SPACES: Space[] = [
  {
    id: 1,
    name: 'Espaço Verde',
    city: 'Curitiba, PR',
    category: 'Chácara',
    types: ['Casamento', 'Corporativo'],
    price: 800,
    priceUnit: 'h',
    capacity: 200,
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=220&fit=crop',
    attributes: ['Estacionamento', 'Wi-Fi', 'Área externa']
  },
  {
    id: 2,
    name: 'Salão Nobre',
    city: 'Curitiba, PR',
    category: 'Salão de Eventos',
    types: ['Formatura', 'Casamento'],
    price: 1200,
    priceUnit: 'h',
    capacity: 400,
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=220&fit=crop',
    attributes: ['Estacionamento', 'Buffet', 'Palco']
  },
  {
    id: 3,
    name: 'Villa Jardim',
    city: 'São José dos Pinhais, PR',
    category: 'Chácara',
    types: ['Casamento', 'Debutante'],
    price: 4800,
    priceUnit: 'dia',
    capacity: 150,
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=220&fit=crop',
    attributes: ['Estacionamento', 'Área externa', 'Piscina']
  },
  {
    id: 4,
    name: 'Centro de Eventos Sul',
    city: 'Curitiba, PR',
    category: 'Espaço Corporativo',
    types: ['Corporativo', 'Show'],
    price: 2500,
    priceUnit: 'h',
    capacity: 800,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=220&fit=crop',
    attributes: ['Wi-Fi', 'Palco', 'Acessibilidade']
  },
  {
    id: 5,
    name: 'Chácara Flores',
    city: 'Colombo, PR',
    category: 'Chácara',
    types: ['Casamento', 'Debutante'],
    price: 600,
    priceUnit: 'h',
    capacity: 180,
    image: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&h=220&fit=crop',
    attributes: ['Estacionamento', 'Área externa']
  },
  {
    id: 6,
    name: 'Espaço Panorama',
    city: 'Curitiba, PR',
    category: 'Salão de Eventos',
    types: ['Corporativo', 'Aniversário'],
    price: 950,
    priceUnit: 'h',
    capacity: 250,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=220&fit=crop',
    attributes: ['Wi-Fi', 'Buffet', 'Acessibilidade']
  }
]

const CATEGORIES = [
  { name: 'Chácara', icon: '🌿', bg: '#fff8e1' },
  { name: 'Salão de Eventos', icon: '🏛', bg: '#f0fdf4' },
  { name: 'Restaurante', icon: '🍽', bg: '#fff0f0' },
  { name: 'Pousada', icon: '🏡', bg: '#f0f8ff' },
  { name: 'Espaço Corporativo', icon: '🏢', bg: '#f5f0ff' }
]

function App() {
  const [page, setPage] = useState<'home' | 'listing' | 'detail'>('home')
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null)
  const [compareList, setCompareList] = useState<number[]>([])
  const [filterCity, setFilterCity] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterGuests, setFilterGuests] = useState('')
  const [filterType, setFilterType] = useState('Todos')

  const toggleCompare = (id: number) => {
    setCompareList(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
    )
  }

  const goToDetail = (space: Space) => {
    setSelectedSpace(space)
    setPage('detail')
    window.scrollTo(0, 0)
  }

  const filteredSpaces = SPACES.filter(s => {
    if (filterCity && !s.city.toLowerCase().includes(filterCity.toLowerCase())) return false
    if (filterGuests && s.capacity < parseInt(filterGuests)) return false
    if (filterType !== 'Todos' && !s.types.includes(filterType)) return false
    return true
  })

  return (
    <div className="app">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => setPage('home')}>
          <div className="logo-box">EWIND</div>
        </div>
        <div className="nav-center">
          <a onClick={() => setPage('listing')}>Espaços</a>
          <a>Fornecedores</a>
          <a>Como funciona</a>
          <a>Anuncie</a>
        </div>
        <div className="nav-right">
          <button className="btn-link">Entrar</button>
          <button className="btn-primary">Cadastrar</button>
        </div>
      </nav>

      {/* HOME */}
      {page === 'home' && (
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
                  <input
                    placeholder="Cidade ou região"
                    value={filterCity}
                    onChange={e => setFilterCity(e.target.value)}
                  />
                </div>
                <div className="sf">
                  <div className="sf-label">Quando</div>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={e => setFilterDate(e.target.value)}
                  />
                </div>
                <div className="sf">
                  <div className="sf-label">Convidados</div>
                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={filterGuests}
                    onChange={e => setFilterGuests(e.target.value)}
                  />
                </div>
                <button className="search-btn" onClick={() => setPage('listing')}>
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
                <div key={c.name} className="cat-card" onClick={() => setPage('listing')}>
                  <div className="cat-icon" style={{ background: c.bg }}>{c.icon}</div>
                  <div className="cat-name">{c.name}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="section" style={{ paddingTop: 0 }}>
            <h2 className="sec-title">Espaços em destaque</h2>
            <div className="cards-3col">
              {SPACES.slice(0, 3).map(s => (
                <div key={s.id} className="card" onClick={() => goToDetail(s)}>
                  <img src={s.image} alt={s.name} />
                  <div className="card-body">
                    <div className="card-name">{s.name}</div>
                    <div className="card-loc">📍 {s.city}</div>
                    <div className="card-tags">
                      {s.types.map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                    <div className="card-foot">
                      <span className="card-price">R${s.price}/{s.priceUnit}</span>
                      <span className="card-cap">👥 até {s.capacity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section" style={{ paddingTop: 0 }}>
            <div className="cta-host">
              <div>
                <div className="cta-title">Tem um espaço para eventos?</div>
                <div className="cta-desc">Anuncie no Ewind e receba solicitações de orçamento de clientes que buscam exatamente o que você oferece.</div>
              </div>
              <button className="btn-primary">Cadastrar meu espaço →</button>
            </div>
          </section>

          <footer className="footer">
            <div className="logo-box-sm">EWIND</div>
            <span>© 2025 Ewind — Marketplace de Espaços para Eventos</span>
          </footer>
        </>
      )}

      {/* LISTING */}
      {page === 'listing' && (
        <>
          <div className="mini-search">
            <input placeholder="Cidade" value={filterCity} onChange={e => setFilterCity(e.target.value)} />
            <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            <input type="number" placeholder="Convidados" value={filterGuests} onChange={e => setFilterGuests(e.target.value)} />
            <select value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option>Todos</option>
              <option>Casamento</option>
              <option>Corporativo</option>
              <option>Aniversário</option>
              <option>Formatura</option>
            </select>
            <button className="btn-primary">Buscar</button>
          </div>

          <div className="listing-wrap">
            <aside className="filters-sidebar">
              <div className="sf-group">
                <div className="sf-group-title">Faixa de preço</div>
                <div className="price-row">
                  <input type="number" placeholder="Mín" />
                  <input type="number" placeholder="Máx" />
                </div>
              </div>

              <div className="sf-group">
                <div className="sf-group-title">Capacidade mínima</div>
                <input type="number" placeholder="Convidados" value={filterGuests} onChange={e => setFilterGuests(e.target.value)} />
              </div>

              <div className="sf-group">
                <div className="sf-group-title">Categoria</div>
                {CATEGORIES.map(c => (
                  <label key={c.name} className="chk-row">
                    <input type="checkbox" />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>

              <div className="sf-group">
                <div className="sf-group-title">Atributos</div>
                {['Estacionamento', 'Wi-Fi', 'Buffet', 'Área externa', 'Palco', 'Piscina', 'Acessibilidade'].map(a => (
                  <label key={a} className="chk-row">
                    <input type="checkbox" />
                    <span>{a}</span>
                  </label>
                ))}
              </div>

              <button className="btn-primary" style={{ width: '100%' }}>Aplicar filtros</button>
            </aside>

            <main className="results-area">
              {compareList.length >= 2 && (
                <div className="cmp-bar">
                  <span>{compareList.length} espaços selecionados</span>
                  <button>Comparar agora →</button>
                </div>
              )}

              <div className="results-bar">
                <span><strong>{filteredSpaces.length} espaços</strong> encontrados</span>
                <select>
                  <option>Relevância</option>
                  <option>Menor preço</option>
                  <option>Maior capacidade</option>
                </select>
              </div>

              <div className="cards-2col">
                {filteredSpaces.map(s => (
                  <div key={s.id} className={`card ${compareList.includes(s.id) ? 'sel' : ''}`}>
                    <img src={s.image} alt={s.name} onClick={() => goToDetail(s)} />
                    <div className="card-body">
                      <div onClick={() => goToDetail(s)}>
                        <div className="card-name">{s.name}</div>
                        <div className="card-loc">📍 {s.city} · {s.category}</div>
                        <div className="card-tags">
                          {s.types.map(t => <span key={t} className="tag">{t}</span>)}
                        </div>
                        <div className="card-foot">
                          <span className="card-price">R${s.price}/{s.priceUnit}</span>
                          <span className="card-cap">👥 até {s.capacity}</span>
                        </div>
                      </div>
                      <button
                        className={`cmp-btn ${compareList.includes(s.id) ? 'on' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleCompare(s.id); }}
                      >
                        {compareList.includes(s.id) ? '✓ Comparando' : '+ Comparar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </>
      )}

      {/* DETAIL */}
      {page === 'detail' && selectedSpace && (
        <>
          <div className="back-bar">
            <a onClick={() => setPage('listing')}>← Voltar à listagem</a>
          </div>
          <div className="det-layout">
            <div>
              <img src={selectedSpace.image.replace('w=400&h=220', 'w=800&h=450')} className="det-main-img" alt="" />
              <div className="card-tags" style={{ marginBottom: 10 }}>
                {selectedSpace.types.map(t => <span key={t} className="tag">{t}</span>)}
              </div>
              <h1 className="det-title">{selectedSpace.name}</h1>
              <div className="det-loc">📍 {selectedSpace.city} · {selectedSpace.category}</div>

              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-val">{selectedSpace.capacity}</div>
                  <div className="stat-lab">Capacidade</div>
                </div>
                <div className="stat-item">
                  <div className="stat-val">3h</div>
                  <div className="stat-lab">Mínimo</div>
                </div>
                <div className="stat-item">
                  <div className="stat-val" style={{ color: '#5aa800' }}>Livre</div>
                  <div className="stat-lab">Disponível</div>
                </div>
              </div>

              <p className="det-desc" style={{ marginTop: 16 }}>
                Espaço com infraestrutura completa para eventos. Ambiente versátil que comporta diversos tipos de celebrações com atendimento personalizado.
              </p>

              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>O que o local oferece</h3>
              <div className="attrs">
                {selectedSpace.attributes.map(a => (
                  <div key={a} className="attr">✓ {a}</div>
                ))}
              </div>
            </div>

            <aside>
              <div className="quote-box">
                <div className="qb-price">R$ {selectedSpace.price}/{selectedSpace.priceUnit === 'h' ? 'hora' : 'dia'}</div>
                <div className="qb-sub">Preço orientativo · sujeito a negociação</div>
                <button className="btn-primary" style={{ width: '100%', padding: 13 }}>
                  Solicitar orçamento
                </button>
                <div className="qb-sec">🔒 Seus dados são protegidos.</div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}

export default App
