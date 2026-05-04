import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

const ADMIN_ID = '8b8b94b2-cbee-4fe7-b1b6-1bcb5af2081b'

const statusColor: Record<string, string> = {
  active: '#16a34a', pending: '#d97706', paused: '#6b7280', rejected: '#dc2626',
  responded: '#2563eb', accepted: '#16a34a', closed: '#6b7280', viewed: '#7c3aed'
}
const statusLabel: Record<string, string> = {
  active: 'Ativo', pending: 'Pendente', paused: 'Pausado', rejected: 'Rejeitado',
  guest: 'Visitante', host: 'Host', supplier: 'Fornecedor',
  responded: 'Respondido', accepted: 'Aceito', closed: 'Fechado', viewed: 'Visto'
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
const fmtDateTime = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function AdminPage({ goToPage }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics-spaces' | 'analytics-suppliers' | 'users' | 'spaces' | 'suppliers' | 'quotes'>('overview')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Data
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [spaces, setSpaces] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])

  // Analytics
  const [categorySpaceStats, setCategorySpaceStats] = useState<any[]>([])
  const [categoryQuoteStats, setCategoryQuoteStats] = useState<any[]>([])
  const [supplierCategoryStats, setSupplierCategoryStats] = useState<any[]>([])
  const [supplierQuoteStats, setSupplierQuoteStats] = useState<any[]>([])
  const [spaceCityStats, setSpaceCityStats] = useState<any[]>([])
  const [spaceStateStats, setSpaceStateStats] = useState<any[]>([])
  const [supplierCityStats, setSupplierCityStats] = useState<any[]>([])
  const [supplierStateStats, setSupplierStateStats] = useState<any[]>([])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

      const [
        { data: profilesData },
        { count: totalSpaces },
        { count: totalSuppliers },
        { count: totalQuotes },
        { count: activeSpaces },
        { count: activeSuppliers },
        { count: pendingSpaces },
        { count: quotesThisMonth },
        { count: spacesThisMonth },
        { count: usersThisMonth },
        { data: spacesData },
        { data: suppliersData },
        { data: quotesData },
        { data: quotesWithSpace },
      ] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }),
        supabase.from('spaces').select('*', { count: 'exact', head: true }),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true }),
        supabase.from('spaces').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('spaces').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
        supabase.from('spaces').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
        supabase.from('spaces').select('id, name, city, state, category, status, created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('suppliers').select('id, name, category, state, status, created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('quotes').select('id, event_type, status, created_at, guests_count, event_date, space_id').order('created_at', { ascending: false }).limit(100),
        supabase.from('quotes').select('space_id, spaces(category)').limit(500),
      ])

      setStats({ totalUsers: profilesData?.length || 0, totalSpaces, totalSuppliers, totalQuotes, activeSpaces, activeSuppliers, pendingSpaces, quotesThisMonth, spacesThisMonth, usersThisMonth })
      setUsers(profilesData || [])
      setSpaces(spacesData || [])
      setSuppliers(suppliersData || [])
      setQuotes(quotesData || [])

      // Analytics: categorias de espaços por cadastros
      const spaceCatMap: Record<string, number> = {}
      spacesData?.forEach((s: any) => { spaceCatMap[s.category] = (spaceCatMap[s.category] || 0) + 1 })
      setCategorySpaceStats(Object.entries(spaceCatMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      // Analytics: categorias por orçamentos
      const quoteCatMap: Record<string, number> = {}
      quotesWithSpace?.forEach((q: any) => {
        const cat = (q.spaces as any)?.category
        if (cat) quoteCatMap[cat] = (quoteCatMap[cat] || 0) + 1
      })
      setCategoryQuoteStats(Object.entries(quoteCatMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      // Analytics: categorias de fornecedores por cadastros
      const suppCatMap: Record<string, number> = {}
      suppliersData?.forEach((s: any) => { suppCatMap[s.category] = (suppCatMap[s.category] || 0) + 1 })
      setSupplierCategoryStats(Object.entries(suppCatMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      // Analytics: tipos de evento por orçamentos
      const evtMap: Record<string, number> = {}
      quotesData?.forEach((q: any) => { evtMap[q.event_type] = (evtMap[q.event_type] || 0) + 1 })
      setSupplierQuoteStats(Object.entries(evtMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      // Geo stats
      const spaceCityMap: Record<string, number> = {}
      const spaceStateMap: Record<string, number> = {}
      spacesData?.forEach((s: any) => {
        spaceCityMap[s.city] = (spaceCityMap[s.city] || 0) + 1
        spaceStateMap[s.state] = (spaceStateMap[s.state] || 0) + 1
      })
      setSpaceCityStats(Object.entries(spaceCityMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))
      setSpaceStateStats(Object.entries(spaceStateMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      const suppCityMap: Record<string, number> = {}
      const suppStateMap: Record<string, number> = {}
      suppliersData?.forEach((s: any) => {
        suppStateMap[s.state] = (suppStateMap[s.state] || 0) + 1
        // suppliers have cities array
        if (Array.isArray((s as any).cities)) {
          (s as any).cities.forEach((c: string) => { suppCityMap[c] = (suppCityMap[c] || 0) + 1 })
        }
      })
      setSupplierCityStats(Object.entries(suppCityMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))
      setSupplierStateStats(Object.entries(suppStateMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const updateSpaceStatus = async (id: string, status: string) => {
    setActionLoading(id)
    await supabase.from('spaces').update({ status }).eq('id', id)
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    setActionLoading(null)
  }

  const updateSupplierStatus = async (id: string, status: string) => {
    setActionLoading(id)
    await supabase.from('suppliers').update({ status }).eq('id', id)
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    setActionLoading(null)
  }

  const deleteUser = async (id: string) => {
    if (id === ADMIN_ID) return
    setActionLoading(id)
    // Remove profile (auth user requires service role — remove profile only)
    await supabase.from('profiles').delete().eq('id', id)
    setUsers(prev => prev.filter(u => u.id !== id))
    setDeleteConfirm(null)
    setActionLoading(null)
  }

  const BarChart = ({ data, maxVal, color = '#a3e635' }: { data: { cat: string; count: number }[]; maxVal: number; color?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: '#2d2d2d' }}>{item.cat}</span>
            <span style={{ fontWeight: 700, color }}>{item.count}</span>
          </div>
          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${maxVal > 0 ? (item.count / maxVal) * 100 : 0}%`, background: color, borderRadius: 100, transition: 'width 0.6s ease' }} />
          </div>
        </div>
      ))}
      {data.length === 0 && <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 24 }}>Sem dados ainda</div>}
    </div>
  )

  const tabs = [
    { key: 'overview', label: '📊 Visão geral' },
    { key: 'analytics-spaces', label: '🏢 Analytics Espaços' },
    { key: 'analytics-suppliers', label: '🛠️ Analytics Fornecedores' },
    { key: 'users', label: '👥 Usuários' },
    { key: 'spaces', label: '🏢 Espaços' },
    { key: 'suppliers', label: '🛠️ Fornecedores' },
    { key: 'quotes', label: '📋 Orçamentos' },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f4f6f8' }}>

      {/* HEADER */}
      <div style={{ background: '#111', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: '#a3e635', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 2 }}>PAINEL ADMINISTRATIVO</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Ewind Admin</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={loadData} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, color: '#ccc', cursor: 'pointer', fontFamily: 'inherit' }}>
            🔄 Atualizar
          </button>
          <button onClick={() => goToPage('home')} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, background: '#a3e635', border: 'none', borderRadius: 7, color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Site
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', overflowX: 'auto' }}>
        <div style={{ display: 'flex', minWidth: 'max-content', padding: '0 24px' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              style={{ padding: '13px 18px', fontSize: 12, fontWeight: 600, border: 'none', background: 'none', borderBottom: activeTab === tab.key ? '2.5px solid #a3e635' : '2.5px solid transparent', color: activeTab === tab.key ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 14 }}>Carregando dados...</div>
        ) : (
          <>
            {/* ===== VISÃO GERAL ===== */}
            {activeTab === 'overview' && stats && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14, marginBottom: 20 }}>
                  {[
                    { label: 'Usuários', value: stats.totalUsers, sub: `+${stats.usersThisMonth} este mês`, icon: '👥', color: '#6366f1' },
                    { label: 'Espaços', value: stats.totalSpaces, sub: `${stats.activeSpaces} ativos`, icon: '🏢', color: '#0ea5e9' },
                    { label: 'Fornecedores', value: stats.totalSuppliers, sub: `${stats.activeSuppliers} ativos`, icon: '🛠️', color: '#8b5cf6' },
                    { label: 'Orçamentos', value: stats.totalQuotes, sub: `+${stats.quotesThisMonth} este mês`, icon: '📋', color: '#f59e0b' },
                    { label: 'Espaços ativos', value: stats.activeSpaces, sub: `${stats.pendingSpaces} pendentes`, icon: '✅', color: '#10b981' },
                    { label: 'Novos espaços/mês', value: stats.spacesThisMonth, sub: 'este mês', icon: '📈', color: '#ec4899' },
                  ].map((kpi, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '18px 20px', border: '1px solid #e8e8e8', borderLeft: `3px solid ${kpi.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: 22 }}>{kpi.icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: kpi.color, background: `${kpi.color}15`, padding: '2px 7px', borderRadius: 100 }}>{kpi.sub}</span>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#2d2d2d', marginBottom: 2 }}>{kpi.value}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ background: '#fff', borderRadius: 12, padding: 22, border: '1px solid #e8e8e8' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>👥 Usuários por perfil</h3>
                    {['guest', 'host', 'supplier'].map(role => {
                      const count = users.filter(u => u.role === role).length
                      const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0
                      return (
                        <div key={role} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                            <span style={{ fontWeight: 600 }}>{statusLabel[role]}</span>
                            <span style={{ color: '#6b7280' }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: role === 'guest' ? '#6366f1' : role === 'host' ? '#0ea5e9' : '#8b5cf6', borderRadius: 100 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div style={{ background: '#fff', borderRadius: 12, padding: 22, border: '1px solid #e8e8e8' }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>🕐 Últimos usuários</h3>
                    {users.slice(0, 6).map(u => (
                      <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f9fafb' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{u.full_name || '—'}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{u.email}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: u.role === 'host' ? '#e0f2fe' : u.role === 'supplier' ? '#f3e8ff' : '#f0fdf4', color: u.role === 'host' ? '#0369a1' : u.role === 'supplier' ? '#6d28d9' : '#166534' }}>
                            {statusLabel[u.role] || u.role}
                          </span>
                          <span style={{ fontSize: 10, color: '#9ca3af' }}>{fmtDate(u.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ===== ANALYTICS ESPAÇOS ===== */}
            {activeTab === 'analytics-spaces' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🏆 Categorias com mais cadastros</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Quais tipos de espaço os anunciantes mais cadastram</p>
                  <BarChart data={categorySpaceStats} maxVal={categorySpaceStats[0]?.count || 1} color="#0ea5e9" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📋 Categorias que mais recebem orçamentos</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Quais tipos de espaço os clientes mais buscam</p>
                  <BarChart data={categoryQuoteStats} maxVal={categoryQuoteStats[0]?.count || 1} color="#a3e635" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📍 Cidades com mais espaços</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Top cidades por número de espaços cadastrados</p>
                  <BarChart data={spaceCityStats.slice(0, 10)} maxVal={spaceCityStats[0]?.count || 1} color="#f59e0b" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🗺️ Estados com mais espaços</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Distribuição geográfica dos espaços por estado</p>
                  <BarChart data={spaceStateStats} maxVal={spaceStateStats[0]?.count || 1} color="#ec4899" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8', gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📊 Comparativo: cadastros vs orçamentos por categoria</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Identifique gargalos — categorias com muitos cadastros mas poucos orçamentos (oferta excedendo demanda) ou vice-versa</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb' }}>
                          {['Categoria', 'Espaços cadastrados', 'Orçamentos recebidos', 'Média orç/espaço'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {categorySpaceStats.map(({ cat, count }) => {
                          const quoteCount = categoryQuoteStats.find(q => q.cat === cat)?.count || 0
                          const avg = count > 0 ? (quoteCount / count).toFixed(1) : '0'
                          return (
                            <tr key={cat} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{cat}</td>
                              <td style={{ padding: '10px 14px', fontSize: 13 }}>
                                <span style={{ fontWeight: 700, color: '#0ea5e9' }}>{count}</span>
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 13 }}>
                                <span style={{ fontWeight: 700, color: '#a3e635' }}>{quoteCount}</span>
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 13 }}>
                                <span style={{ fontWeight: 700, color: parseFloat(avg) >= 1 ? '#10b981' : '#f59e0b' }}>{avg}</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ANALYTICS FORNECEDORES ===== */}
            {activeTab === 'analytics-suppliers' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🏆 Categorias de fornecedores com mais cadastros</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Quais serviços os profissionais mais oferecem</p>
                  <BarChart data={supplierCategoryStats} maxVal={supplierCategoryStats[0]?.count || 1} color="#8b5cf6" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🎉 Tipos de evento mais solicitados</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Quais eventos geram mais orçamentos no Ewind</p>
                  <BarChart data={supplierQuoteStats} maxVal={supplierQuoteStats[0]?.count || 1} color="#f59e0b" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📍 Cidades com mais fornecedores</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Top cidades por atuação de fornecedores</p>
                  <BarChart data={supplierCityStats.slice(0, 10)} maxVal={supplierCityStats[0]?.count || 1} color="#f59e0b" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🗺️ Estados com mais fornecedores</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Distribuição geográfica dos fornecedores por estado</p>
                  <BarChart data={supplierStateStats} maxVal={supplierStateStats[0]?.count || 1} color="#10b981" />
                </div>

                <div style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8', gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📊 Fornecedores por categoria — detalhado</h3>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>Distribuição completa dos fornecedores cadastrados</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {supplierCategoryStats.map(({ cat, count }) => {
                      const pct = suppliers.length > 0 ? Math.round((count / suppliers.length) * 100) : 0
                      return (
                        <div key={cat} style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px', border: '1px solid #e8e8e8' }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: '#8b5cf6', marginBottom: 2 }}>{count}</div>
                          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: '#2d2d2d' }}>{cat}</div>
                          <div style={{ height: 4, background: '#e8e8e8', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: '#8b5cf6', borderRadius: 100 }} />
                          </div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>{pct}% do total</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ===== USUÁRIOS ===== */}
            {activeTab === 'users' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>👥 Todos os usuários ({users.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Nome', 'Email', 'Perfil', 'Cadastro', 'Ações'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600 }}>
                            {u.id === ADMIN_ID && <span style={{ fontSize: 9, background: '#a3e635', color: '#1a2e05', padding: '2px 6px', borderRadius: 100, marginRight: 6, fontWeight: 800 }}>ADMIN</span>}
                            {u.full_name || '—'}
                          </td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#6b7280' }}>{u.email}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: u.role === 'host' ? '#e0f2fe' : u.role === 'supplier' ? '#f3e8ff' : '#f0fdf4', color: u.role === 'host' ? '#0369a1' : u.role === 'supplier' ? '#6d28d9' : '#166534' }}>
                              {statusLabel[u.role] || u.role}
                            </span>
                          </td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#9ca3af' }}>{fmtDateTime(u.created_at)}</td>
                          <td style={{ padding: '11px 16px' }}>
                            {u.id !== ADMIN_ID && (
                              deleteConfirm === u.id ? (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <span style={{ fontSize: 11, color: '#dc2626' }}>Confirmar exclusão?</span>
                                  <button onClick={() => deleteUser(u.id)} disabled={actionLoading === u.id}
                                    style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 5, color: '#dc2626', cursor: 'pointer' }}>
                                    {actionLoading === u.id ? '...' : 'Sim'}
                                  </button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    style={{ padding: '3px 8px', fontSize: 11, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 5, color: '#6b7280', cursor: 'pointer' }}>
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(u.id)}
                                  style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 6, color: '#dc2626', cursor: 'pointer' }}>
                                  🗑 Excluir
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== ESPAÇOS ===== */}
            {activeTab === 'spaces' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>🏢 Espaços ({spaces.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Nome', 'Cidade', 'Categoria', 'Status', 'Data', 'Ações'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spaces.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600 }}>{s.name}</td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#6b7280' }}>{s.city}, {s.state}</td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#6b7280' }}>{s.category}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: `${statusColor[s.status]}18`, color: statusColor[s.status] }}>
                              {statusLabel[s.status] || s.status}
                            </span>
                          </td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#9ca3af' }}>{fmtDate(s.created_at)}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <div style={{ display: 'flex', gap: 5 }}>
                              {s.status !== 'active' && <button onClick={() => updateSpaceStatus(s.id, 'active')} disabled={actionLoading === s.id} style={{ padding: '3px 9px', fontSize: 11, fontWeight: 700, background: '#dcfce7', border: 'none', borderRadius: 5, color: '#16a34a', cursor: 'pointer' }}>✓ Ativar</button>}
                              {s.status === 'active' && <button onClick={() => updateSpaceStatus(s.id, 'paused')} disabled={actionLoading === s.id} style={{ padding: '3px 9px', fontSize: 11, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 5, color: '#6b7280', cursor: 'pointer' }}>⏸ Pausar</button>}
                              {s.status !== 'rejected' && <button onClick={() => updateSpaceStatus(s.id, 'rejected')} disabled={actionLoading === s.id} style={{ padding: '3px 9px', fontSize: 11, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 5, color: '#dc2626', cursor: 'pointer' }}>✕</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== FORNECEDORES ===== */}
            {activeTab === 'suppliers' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>🛠️ Fornecedores ({suppliers.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Nome', 'Categoria', 'Estado', 'Status', 'Data', 'Ações'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600 }}>{s.name}</td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#6b7280' }}>{s.category}</td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#6b7280' }}>{s.state}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: `${statusColor[s.status] || '#9ca3af'}18`, color: statusColor[s.status] || '#9ca3af' }}>
                              {statusLabel[s.status] || s.status}
                            </span>
                          </td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#9ca3af' }}>{fmtDate(s.created_at)}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <div style={{ display: 'flex', gap: 5 }}>
                              {s.status !== 'active' && <button onClick={() => updateSupplierStatus(s.id, 'active')} disabled={actionLoading === s.id} style={{ padding: '3px 9px', fontSize: 11, fontWeight: 700, background: '#dcfce7', border: 'none', borderRadius: 5, color: '#16a34a', cursor: 'pointer' }}>✓ Ativar</button>}
                              {s.status === 'active' && <button onClick={() => updateSupplierStatus(s.id, 'paused')} disabled={actionLoading === s.id} style={{ padding: '3px 9px', fontSize: 11, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 5, color: '#6b7280', cursor: 'pointer' }}>⏸ Pausar</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== ORÇAMENTOS ===== */}
            {activeTab === 'quotes' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>📋 Orçamentos ({quotes.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Tipo de evento', 'Convidados', 'Data do evento', 'Status', 'Enviado em'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map(q => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600 }}>{q.event_type}</td>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: '#6b7280' }}>{q.guests_count || '—'}</td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#6b7280' }}>{q.event_date ? new Date(q.event_date).toLocaleDateString('pt-BR') : '—'}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: `${statusColor[q.status] || '#9ca3af'}20`, color: statusColor[q.status] || '#9ca3af' }}>
                              {statusLabel[q.status] || q.status}
                            </span>
                          </td>
                          <td style={{ padding: '11px 16px', fontSize: 12, color: '#9ca3af' }}>{fmtDateTime(q.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
