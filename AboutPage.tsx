import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES, ATTRIBUTES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page, space?: Space) => void
  compareSpaces: Space[]
  onCompareToggle: (space: Space) => void
  onClearCompare: () => void
}

const SpaceCard = memo(({ space, onClick, onCompare, isComparing }: {
  space: Space
  onClick: () => void
  onCompare: (e: React.MouseEvent) => void
  isComparing: boolean
}) => (
  <div className="card" style={{ position: 'relative' }}>
    <div style={{ position: 'relative' }}>
      <img
        src={space.media_urls[0] || 'https://via.placeholder.com/400x200?text=Sem+foto'}
        alt={space.name}
        loading="lazy"
        onClick={onClick}
        style={{ cursor: 'pointer', width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
      />
      {/* Botão comparar sobre a imagem */}
      <button
        onClick={onCompare}
        style={{
          position: 'absolute', bottom: 8, right: 8,
          padding: '5px 10px', fontSize: 11, fontWeight: 700,
          background: isComparing ? '#a3e635' : 'rgba(0,0,0,0.6)',
          color: isComparing ? '#1a2e05' : '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {isComparing ? '✓ Comparando' : '+ Comparar'}
      </button>
    </div>
    <div className="card-body" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="card-name">{space.name}</div>
      <div className="card-loc">📍 {space.city}, {space.state} · {space.category}</div>
      <div className="card-tags">
        {space.event_types.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
      </div>
      <div className="card-foot">
        <span className="card-price">
          {space.price_per_hour ? `R$${space.price_per_hour}/h` : `R$${space.price_per_day}/dia`}
        </span>
        <span className="card-cap">👥 até {space.capacity}</span>
      </div>
    </div>
  </div>
))

export default function ListingPage({ goToPage, compareSpaces, onCompareToggle, onClearCompare }: Props) {
  const [filterCity, setFilterCity] = useState('')
  const [filterGuests, setFilterGuests] = useState('')
  const [filterCategory, setFilterCategory] = useState<string[]>([])
  const [filterAttrs, setFilterAttrs] = useState<string[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('spaces')
        .select('id, host_id, name, city, state, category, event_types, media_urls, price_per_hour, price_per_day, capacity, attributes, min_hours, address, description, status, created_at, updated_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (!cancelled && data) setSpaces(data)
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggleCategory = useCallback((cat: string) => {
    setFilterCategory(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }, [])

  const toggleAttr = useCallback((attr: string) => {
    setFilterAttrs(prev => prev.includes(attr) ? prev.filter(a => a !== attr) : [...prev, attr])
  }, [])

  const clearFilters = useCallback(() => {
    setFilterCategory([])
    setFilterAttrs([])
    setFilterCity('')
    setFilterGuests('')
  }, [])

  const filteredSpaces = useMemo(() => {
    return spaces.filter(s => {
      if (filterCity && !s.city.toLowerCase().includes(filterCity.toLowerCase())) return false
      if (filterGuests && s.capacity < parseInt(filterGuests)) return false
      if (filterCategory.length > 0 && !filterCategory.includes(s.category)) return false
      if (filterAttrs.length > 0 && !filterAttrs.every(a => s.attributes.includes(a))) return false
      return true
    })
  }, [spaces, filterCity, filterGuests, filterCategory, filterAttrs])

  const compareIds = useMemo(() => new Set(compareSpaces.map(s => s.id)), [compareSpaces])

  return (
    <>
      <div className="mini-search">
        <input placeholder="Cidade" value={filterCity} onChange={e => setFilterCity(e.target.value)} />
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
          <button className="btn-primary" style={{ width: '100%' }} onClick={clearFilters}>
            Limpar filtros
          </button>
        </aside>

        <main className="results-area">
          <div className="results-bar">
            <span><strong>{filteredSpaces.length} espaços</strong> encontrados</span>
            {compareSpaces.length > 0 && (
              <span style={{ fontSize: 12, color: '#5aa800', fontWeight: 600 }}>
                {compareSpaces.length} selecionado(s) para comparar
              </span>
            )}
          </div>

          {loading && <p style={{ color: '#6b7280', fontSize: 14 }}>Carregando espaços...</p>}

          {!loading && filteredSpaces.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Nenhum espaço encontrado</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                {spaces.length === 0 ? 'Ainda não há espaços cadastrados.' : 'Tente ajustar os filtros.'}
              </p>
            </div>
          )}

          <div className="cards-2col">
            {filteredSpaces.map(s => (
              <SpaceCard
                key={s.id}
                space={s}
                onClick={() => goToPage('detail', s)}
                onCompare={(e) => {
                  e.stopPropagation()
                  onCompareToggle(s)
                }}
                isComparing={compareIds.has(s.id)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* BARRA FLUTUANTE DE COMPARAÇÃO */}
      {compareSpaces.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a1a', borderRadius: 16, padding: '14px 20px',
          display: 'flex', alignItems: 'center', gap: 12, zIndex: 999,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)', flexWrap: 'wrap',
          maxWidth: 'calc(100vw - 40px)'
        }}>
          <span style={{ fontSize: 13, color: '#aaa', fontWeight: 600, whiteSpace: 'nowrap' }}>
            📊 Comparar:
          </span>

          {/* Miniaturas dos espaços selecionados */}
          <div style={{ display: 'flex', gap: 8 }}>
            {compareSpaces.map(s => (
              <div key={s.id} style={{ position: 'relative' }}>
                <img
                  src={s.media_urls[0] || 'https://via.placeholder.com/40x40'}
                  alt={s.name}
                  style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '2px solid #a3e635' }}
                />
                <button
                  onClick={() => onCompareToggle(s)}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    background: '#ef4444', color: '#fff', border: 'none',
                    borderRadius: '50%', width: 18, height: 18,
                    cursor: 'pointer', fontSize: 10, fontWeight: 700
                  }}
                >×</button>
              </div>
            ))}

            {/* Slots vazios */}
            {Array.from({ length: 3 - compareSpaces.length }).map((_, i) => (
              <div key={i} style={{
                width: 40, height: 40, borderRadius: 8,
                border: '2px dashed #444', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#555', fontSize: 18
              }}>+</div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginLeft: 4 }}>
            <button
              onClick={() => goToPage('comparison')}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: 13, whiteSpace: 'nowrap' }}
            >
              Ver comparação →
            </button>
            <button
              onClick={onClearCompare}
              style={{
                padding: '8px 14px', fontSize: 12, fontWeight: 600,
                background: 'transparent', border: '1px solid #444',
                borderRadius: 8, cursor: 'pointer', color: '#aaa',
                whiteSpace: 'nowrap'
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Espaço extra no fundo quando barra aparece */}
      {compareSpaces.length > 0 && <div style={{ height: 80 }} />}
    </>
  )
}
