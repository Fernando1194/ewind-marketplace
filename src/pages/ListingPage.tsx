import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES, ATTRIBUTES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page, space?: Space) => void
}

export default function ListingPage({ goToPage }: Props) {
  const [filterCity, setFilterCity] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterGuests, setFilterGuests] = useState('')
  const [filterCategory, setFilterCategory] = useState<string[]>([])
  const [filterAttrs, setFilterAttrs] = useState<string[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSpaces()
  }, [])

  const loadSpaces = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (data) setSpaces(data)
    setLoading(false)
  }

  const toggleCategory = (cat: string) => {
    setFilterCategory(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const toggleAttr = (attr: string) => {
    setFilterAttrs(prev =>
      prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr]
    )
  }

  const filteredSpaces = spaces.filter(s => {
    if (filterCity && !s.city.toLowerCase().includes(filterCity.toLowerCase())) return false
    if (filterGuests && s.capacity < parseInt(filterGuests)) return false
    if (filterCategory.length > 0 && !filterCategory.includes(s.category)) return false
    if (filterAttrs.length > 0 && !filterAttrs.every(a => s.attributes.includes(a))) return false
    return true
  })

  return (
    <>
      <div className="mini-search">
        <input placeholder="Cidade" value={filterCity} onChange={e => setFilterCity(e.target.value)} />
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        <input type="number" placeholder="Convidados" value={filterGuests} onChange={e => setFilterGuests(e.target.value)} />
        <button className="btn-primary">Buscar</button>
      </div>

      <div className="listing-wrap">
        <aside className="filters-sidebar">
          <div className="sf-group">
            <div className="sf-group-title">Capacidade mínima</div>
            <input type="number" placeholder="Convidados" value={filterGuests} onChange={e => setFilterGuests(e.target.value)} />
          </div>
          <div className="sf-group">
            <div className="sf-group-title">Categoria</div>
            {CATEGORIES.map(c => (
              <label key={c.name} className="chk-row">
                <input type="checkbox" checked={filterCategory.includes(c.name)} onChange={() => toggleCategory(c.name)} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
          <div className="sf-group">
            <div className="sf-group-title">Atributos</div>
            {ATTRIBUTES.slice(0, 7).map(a => (
              <label key={a} className="chk-row">
                <input type="checkbox" checked={filterAttrs.includes(a)} onChange={() => toggleAttr(a)} />
                <span>{a}</span>
              </label>
            ))}
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => { setFilterCategory([]); setFilterAttrs([]); setFilterCity(''); setFilterGuests('') }}>
            Limpar filtros
          </button>
        </aside>

        <main className="results-area">
          <div className="results-bar">
            <span><strong>{filteredSpaces.length} espaços</strong> encontrados</span>
          </div>

          {loading && <p>Carregando...</p>}

          {!loading && filteredSpaces.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Nenhum espaço encontrado</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                {spaces.length === 0 ? 'Ainda não há espaços cadastrados. Seja o primeiro!' : 'Tente ajustar os filtros.'}
              </p>
            </div>
          )}

          <div className="cards-2col">
            {filteredSpaces.map(s => (
              <div key={s.id} className="card" onClick={() => goToPage('detail', s)}>
                <img src={s.media_urls[0] || 'https://via.placeholder.com/400x200?text=Sem+foto'} alt={s.name} />
                <div className="card-body">
                  <div className="card-name">{s.name}</div>
                  <div className="card-loc">📍 {s.city}, {s.state} · {s.category}</div>
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
        </main>
      </div>
    </>
  )
}
