import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react'
import { supabase } from '../supabase'
import { CATEGORIES, ATTRIBUTES, EVENT_TYPES } from '../types'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page, space?: Space) => void
  compareSpaces: Space[]
  onCompareToggle: (space: Space) => void
  onClearCompare: () => void
}

const STATES = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
const PAGE_SIZE = 9

// Cache simples em memória — evita refetch ao voltar para a página
const cache: { spaces: Space[] | null; ts: number } = { spaces: null, ts: 0 }
const CACHE_TTL = 60_000 // 1 minuto

const SpaceCard = memo(({ space, onClick, onCompare, isComparing }: {
  space: Space; onClick: () => void; onCompare: (e: React.MouseEvent) => void; isComparing: boolean
}) => (
  <div className="card" style={{ position: 'relative' }}>
    <div style={{ position: 'relative' }}>
      <img src={space.media_urls[0] || 'https://via.placeholder.com/400x200?text=Sem+foto'} alt={space.name}
        loading="lazy" onClick={onClick}
        style={{ cursor: 'pointer', width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
      <button onClick={onCompare} style={{
        position: 'absolute', bottom: 8, right: 8, padding: '5px 10px', fontSize: 11, fontWeight: 700,
        background: isComparing ? '#a3e635' : 'rgba(0,0,0,0.6)', color: isComparing ? '#1a2e05' : '#fff',
        border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s'
      }}>
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
        <span className="card-price">{space.price_per_hour ? `R$${space.price_per_hour.toLocaleString('pt-BR')}/h` : `R$${space.price_per_day?.toLocaleString('pt-BR')}/dia`}</span>
        <span className="card-cap">👥 até {space.capacity}</span>
      </div>
    </div>
  </div>
))

export default function ListingPage({ goToPage, compareSpaces, onCompareToggle, onClearCompare }: Props) {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  // Filtros
  const [filterCity, setFilterCity] = useState('')
  const [filterState, setFilterState] = useState('')
  const [filterCategory, setFilterCategory] = useState<string[]>([])
  const [filterEventTypes, setFilterEventTypes] = useState<string[]>([])
  const [filterAttrs, setFilterAttrs] = useState<string[]>([])
  const [filterMinCapacity, setFilterMinCapacity] = useState('')
  const [filterMaxCapacity, setFilterMaxCapacity] = useState('')
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')

  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const load = async () => {
      // Usar cache se ainda válido
      if (cache.spaces && Date.now() - cache.ts < CACHE_TTL) {
        setSpaces(cache.spaces)
        setLoading(false)
        return
      }

      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setLoading(true)

      const { data } = await supabase
        .from('spaces')
        .select('id, host_id, name, city, state, category, event_types, media_urls, price_per_hour, price_per_day, capacity, attributes, min_hours, address, description, neighborhood, area_covered, area_uncovered, whatsapp, instagram, facebook, website, cardapio_url, status, created_at, updated_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (data) {
        cache.spaces = data
        cache.ts = Date.now()
        setSpaces(data)
      }
      setLoading(false)
    }
    load()
    return () => abortRef.current?.abort()
  }, [])

  // Reset página ao filtrar
  useEffect(() => { setCurrentPage(1) }, [filterCity, filterState, filterCategory, filterEventTypes, filterAttrs, filterMinCapacity, filterMaxCapacity, filterMinPrice, filterMaxPrice])

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])

  const clearFilters = useCallback(() => {
    setFilterCity(''); setFilterState(''); setFilterCategory([])
    setFilterEventTypes([]); setFilterAttrs([])
    setFilterMinCapacity(''); setFilterMaxCapacity('')
    setFilterMinPrice(''); setFilterMaxPrice('')
  }, [])

  const activeFiltersCount = [filterCity, filterState, ...filterCategory, ...filterEventTypes, ...filterAttrs, filterMinCapacity, filterMaxCapacity, filterMinPrice, filterMaxPrice].filter(Boolean).length

  const filtered = useMemo(() => spaces.filter(s => {
    if (filterCity && !s.city.toLowerCase().includes(filterCity.toLowerCase())) return false
    if (filterState && s.state !== filterState) return false
    if (filterCategory.length > 0 && !filterCategory.includes(s.category)) return false
    if (filterEventTypes.length > 0 && !filterEventTypes.some(t => s.event_types.includes(t))) return false
    if (filterAttrs.length > 0 && !filterAttrs.every(a => s.attributes.includes(a))) return false
    if (filterMinCapacity && s.capacity < parseInt(filterMinCapacity)) return false
    if (filterMaxCapacity && s.capacity > parseInt(filterMaxCapacity)) return false
    const price = s.price_per_hour || s.price_per_day || 0
    if (filterMinPrice && price < parseFloat(filterMinPrice)) return false
    if (filterMaxPrice && price > parseFloat(filterMaxPrice)) return false
    return true
  }), [spaces, filterCity, filterState, filterCategory, filterEventTypes, filterAttrs, filterMinCapacity, filterMaxCapacity, filterMinPrice, filterMaxPrice])

  // Paginação
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage])
  const compareIds = useMemo(() => new Set(compareSpaces.map(s => s.id)), [compareSpaces])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <div className="mini-search">
        <input placeholder="Cidade" value={filterCity} onChange={e => setFilterCity(e.target.value)} />
        <select value={filterState} onChange={e => setFilterState(e.target.value)}
          style={{ padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
          <option value="">Estado</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-primary" onClick={clearFilters}>Buscar</button>
      </div>

      <div className="listing-wrap">
        <aside className="filters-sidebar">
          <div className="sf-group">
            <div className="sf-group-title">Localização</div>
            <input type="text" placeholder="Cidade" value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{ marginBottom: 8 }} />
            <select value={filterState} onChange={e => setFilterState(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
              <option value="">Todos os estados</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="sf-group">
            <div className="sf-group-title">Capacidade (pessoas)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <input type="number" placeholder="Mín" value={filterMinCapacity} onChange={e => setFilterMinCapacity(e.target.value)} min={0} />
              <input type="number" placeholder="Máx" value={filterMaxCapacity} onChange={e => setFilterMaxCapacity(e.target.value)} min={0} />
            </div>
          </div>

          <div className="sf-group">
            <div className="sf-group-title">Faixa de preço (R$)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <input type="number" placeholder="Mín" value={filterMinPrice} onChange={e => setFilterMinPrice(e.target.value)} min={0} />
              <input type="number" placeholder="Máx" value={filterMaxPrice} onChange={e => setFilterMaxPrice(e.target.value)} min={0} />
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>Aplicado ao preço/hora ou diária</p>
          </div>

          <div className="sf-group">
            <div className="sf-group-title">Categoria</div>
            {CATEGORIES.map(c => (
              <label key={c.name} className="chk-row">
                <input type="checkbox" checked={filterCategory.includes(c.name)} onChange={() => toggleArr(filterCategory, c.name, setFilterCategory)} />
                <span>{c.icon} {c.name}</span>
              </label>
            ))}
          </div>

          <div className="sf-group">
            <div className="sf-group-title">Tipo de evento</div>
            {EVENT_TYPES.map(t => (
              <label key={t} className="chk-row">
                <input type="checkbox" checked={filterEventTypes.includes(t)} onChange={() => toggleArr(filterEventTypes, t, setFilterEventTypes)} />
                <span>{t}</span>
              </label>
            ))}
          </div>

          <div className="sf-group">
            <div className="sf-group-title">Atributos</div>
            {ATTRIBUTES.map(a => (
              <label key={a} className="chk-row">
                <input type="checkbox" checked={filterAttrs.includes(a)} onChange={() => toggleArr(filterAttrs, a, setFilterAttrs)} />
                <span>{a}</span>
              </label>
            ))}
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={clearFilters}>
            Limpar filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>
        </aside>

        <main className="results-area">
          <div className="results-bar">
            <span>
              <strong>{filtered.length} espaços</strong> encontrados
              {filtered.length > PAGE_SIZE && (
                <span style={{ color: '#9ca3af', fontSize: 12, marginLeft: 6 }}>
                  · página {currentPage} de {totalPages}
                </span>
              )}
            </span>
            {compareSpaces.length > 0 && (
              <span style={{ fontSize: 12, color: '#5aa800', fontWeight: 600 }}>
                {compareSpaces.length} selecionado(s) para comparar
              </span>
            )}
          </div>

          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: 280, borderRadius: 14, background: 'linear-gradient(90deg, #f3f4f6 25%, #e8e8e8 50%, #f3f4f6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Nenhum espaço encontrado</h3>
              <p style={{ fontSize: 13, color: '#6b7280' }}>
                {spaces.length === 0 ? 'Ainda não há espaços cadastrados.' : 'Tente ajustar os filtros.'}
              </p>
              {activeFiltersCount > 0 && (
                <button className="btn-primary" style={{ marginTop: 12 }} onClick={clearFilters}>Limpar filtros</button>
              )}
            </div>
          )}

          <div className="cards-2col">
            {paginated.map(s => (
              <SpaceCard key={s.id} space={s}
                onClick={() => goToPage('detail', s)}
                onCompare={(e) => { e.stopPropagation(); onCompareToggle(s) }}
                isComparing={compareIds.has(s.id)} />
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 32, paddingTop: 24, borderTop: '1px solid #e8e8e8' }}>
              <button
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); scrollToTop() }}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: '1.5px solid #e8e8e8', borderRadius: 8, background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1 }}>
                ← Anterior
              </button>

              <div style={{ display: 'flex', gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc: (number | string)[], p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) => p === '...' ? (
                    <span key={`d${i}`} style={{ padding: '8px 4px', fontSize: 13, color: '#9ca3af' }}>…</span>
                  ) : (
                    <button key={p} onClick={() => { setCurrentPage(p as number); scrollToTop() }}
                      style={{ width: 36, height: 36, fontSize: 13, fontWeight: 600, border: '1.5px solid', borderColor: currentPage === p ? '#a3e635' : '#e8e8e8', borderRadius: 8, background: currentPage === p ? '#f0fdf4' : '#fff', color: currentPage === p ? '#1a2e05' : '#2d2d2d', cursor: 'pointer' }}>
                      {p}
                    </button>
                  ))}
              </div>

              <button
                onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); scrollToTop() }}
                disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: '1.5px solid #e8e8e8', borderRadius: 8, background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1 }}>
                Próxima →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Barra flutuante comparação */}
      {compareSpaces.length > 0 && (
        <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.3)', flexWrap: 'wrap', maxWidth: 'calc(100vw - 40px)' }}>
          <span style={{ fontSize: 13, color: '#aaa', fontWeight: 600, whiteSpace: 'nowrap' }}>📊 Comparar:</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {compareSpaces.map(s => (
              <div key={s.id} style={{ position: 'relative' }}>
                <img src={s.media_urls[0] || 'https://via.placeholder.com/40x40'} alt={s.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '2px solid #a3e635' }} />
                <button onClick={() => onCompareToggle(s)} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', fontSize: 10, fontWeight: 700 }}>×</button>
              </div>
            ))}
            {Array.from({ length: 3 - compareSpaces.length }).map((_, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 8, border: '2px dashed #444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 18 }}>+</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginLeft: 4 }}>
            <button onClick={() => goToPage('comparison')} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13, whiteSpace: 'nowrap' }}>Ver comparação →</button>
            <button onClick={onClearCompare} style={{ padding: '8px 14px', fontSize: 12, fontWeight: 600, background: 'transparent', border: '1px solid #444', borderRadius: 8, cursor: 'pointer', color: '#aaa' }}>Limpar</button>
          </div>
        </div>
      )}
      {compareSpaces.length > 0 && <div style={{ height: 80 }} />}
    </>
  )
}
