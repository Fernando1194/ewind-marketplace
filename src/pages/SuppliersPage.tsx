import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { supabase } from '../supabase'
import { SUPPLIER_CATEGORIES } from '../types'
import type { Supplier } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page, supplier?: Supplier) => void
}

const SupplierCard = memo(({ supplier, onClick }: { supplier: Supplier; onClick: () => void }) => {
  const cat = SUPPLIER_CATEGORIES.find(c => c.name === supplier.category)
  return (
    <div className="card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div style={{ position: 'relative' }}>
        <img
          src={supplier.media_urls[0] || 'https://via.placeholder.com/400x200?text=Sem+foto'}
          alt={supplier.name}
          loading="lazy"
          style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: cat?.bg || '#f0fdf4', borderRadius: 20,
          padding: '4px 10px', fontSize: 11, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          {cat?.icon} {supplier.category}
        </div>
      </div>
      <div className="card-body">
        <div className="card-name">{supplier.name}</div>
        {supplier.subcategory && (
          <div style={{ fontSize: 12, color: '#5aa800', fontWeight: 600, marginBottom: 4 }}>
            {supplier.subcategory}
          </div>
        )}
        <div className="card-loc">
          📍 {supplier.cities.slice(0, 2).join(', ')}{supplier.cities.length > 2 ? ` +${supplier.cities.length - 2}` : ''}, {supplier.state}
        </div>
        {supplier.price_info && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            💰 {supplier.price_info}
          </div>
        )}
        <div className="card-tags" style={{ marginTop: 8 }}>
          {supplier.event_types.slice(0, 2).map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
    </div>
  )
})

export default function SuppliersPage({ goToPage }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [filterCity, setFilterCity] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('suppliers')
        .select('id, owner_id, name, description, category, subcategory, cities, state, price_info, media_urls, event_types, attributes, whatsapp, instagram, email, website, status, created_at, updated_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      if (!cancelled && data) setSuppliers(data)
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  const toggleCategory = useCallback((cat: string) => {
    setFilterCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }, [])

  const clearFilters = useCallback(() => {
    setFilterCategories([])
    setFilterCity('')
  }, [])

  const filtered = useMemo(() => {
    return suppliers.filter(s => {
      if (filterCategories.length > 0 && !filterCategories.includes(s.category)) return false
      if (filterCity && !s.cities.some(c => c.toLowerCase().includes(filterCity.toLowerCase()))) return false
      return true
    })
  }, [suppliers, filterCategories, filterCity])

  return (
    <>
      {/* Mini search */}
      <div className="mini-search">
        <input
          placeholder="Cidade"
          value={filterCity}
          onChange={e => setFilterCity(e.target.value)}
        />
        <button className="btn-primary">Buscar</button>
      </div>

      <div className="listing-wrap">
        {/* Sidebar */}
        <aside className="filters-sidebar">

          {/* Cidade */}
          <div className="sf-group">
            <div className="sf-group-title">Cidade</div>
            <input
              type="text"
              placeholder="Ex: Curitiba"
              value={filterCity}
              onChange={e => setFilterCity(e.target.value)}
            />
          </div>

          {/* Categorias como checkboxes alinhados */}
          <div className="sf-group">
            <div className="sf-group-title">Categoria</div>
            {SUPPLIER_CATEGORIES.map(c => (
              <label
                key={c.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: filterCategories.includes(c.name) ? '#1a2e05' : '#6b7280',
                  fontWeight: filterCategories.includes(c.name) ? 600 : 400,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: filterCategories.includes(c.name) ? '#f0fdf4' : 'transparent',
                  border: filterCategories.includes(c.name) ? '1px solid #a3e635' : '1px solid transparent',
                  transition: 'all 0.15s'
                }}
              >
                <input
                  type="checkbox"
                  checked={filterCategories.includes(c.name)}
                  onChange={() => toggleCategory(c.name)}
                  style={{ accentColor: '#a3e635', width: 14, height: 14, flexShrink: 0 }}
                />
                <span style={{ fontSize: 15, flexShrink: 0 }}>{c.icon}</span>
                <span style={{ lineHeight: 1.3 }}>{c.name}</span>
              </label>
            ))}
          </div>

          {/* Chips selecionados */}
          {filterCategories.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div className="sf-group-title">Filtros ativos</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {filterCategories.map(cat => {
                  const c = SUPPLIER_CATEGORIES.find(x => x.name === cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px',
                        background: '#a3e635', border: 'none', borderRadius: 100,
                        cursor: 'pointer', color: '#1a2e05', display: 'flex',
                        alignItems: 'center', gap: 4, fontFamily: 'inherit'
                      }}
                    >
                      {c?.icon} {cat} ×
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={clearFilters}
          >
            Limpar filtros
          </button>
        </aside>

        {/* Results */}
        <main className="results-area">
          <div className="results-bar">
            <span><strong>{filtered.length} fornecedores</strong> encontrados</span>
            <button
              className="btn-primary"
              style={{ fontSize: 13, padding: '8px 16px' }}
              onClick={() => goToPage('supplier-signup')}
            >
              + Anunciar serviço
            </button>
          </div>

          {loading && (
            <p style={{ color: '#6b7280', fontSize: 14 }}>Carregando fornecedores...</p>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, background: '#f9fafb', borderRadius: 14 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                {filterCategories.length > 0 || filterCity
                  ? 'Nenhum fornecedor encontrado'
                  : 'Seja o primeiro a anunciar!'}
              </h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
                {filterCategories.length > 0 || filterCity
                  ? 'Tente ajustar os filtros.'
                  : 'Cadastre seus serviços e apareça para quem está organizando eventos.'}
              </p>
              <button className="btn-primary" onClick={() => goToPage('supplier-signup')}>
                + Anunciar meu serviço
              </button>
            </div>
          )}

          <div className="cards-2col">
            {filtered.map(s => (
              <SupplierCard
                key={s.id}
                supplier={s}
                onClick={() => goToPage('supplier-detail', s)}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  )
}
