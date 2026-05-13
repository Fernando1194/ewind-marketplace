import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props { goToPage: (page: Page) => void }

const ADMIN_ID = '8b8b94b2-cbee-4fe7-b1b6-1bcb5af2081b'

const STATUS_COLOR: Record<string, string> = {
  active: '#16a34a', pending: '#d97706', paused: '#6b7280', rejected: '#dc2626',
  responded: '#2563eb', accepted: '#16a34a', closed: '#6b7280', viewed: '#7c3aed'
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Ativo', pending: 'Pendente', paused: 'Pausado', rejected: 'Rejeitado',
  guest: 'Visitante', host: 'Host', supplier: 'Fornecedor',
  responded: 'Respondido', accepted: 'Aceito', closed: 'Fechado', viewed: 'Visto'
}

const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
const fmtFull = (d: string) => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

export default function AdminPage({ goToPage }: Props) {
  const [tab, setTab] = useState<'overview' | 'analytics-spaces' | 'analytics-suppliers' | 'users' | 'spaces' | 'suppliers' | 'quotes' | 'logs' | 'feedbacks'>('overview')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Data
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [spaces, setSpaces] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [quotes, setQuotes] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loadingFb, setLoadingFb] = useState(false)

  // Analytics
  const [catSpaceStats, setCatSpaceStats] = useState<any[]>([])
  const [catQuoteStats, setCatQuoteStats] = useState<any[]>([])
  const [suppCatStats, setSuppCatStats] = useState<any[]>([])
  const [evtStats, setEvtStats] = useState<any[]>([])
  const [spaceCityStats, setSpaceCityStats] = useState<any[]>([])
  const [spaceStateStats, setSpaceStateStats] = useState<any[]>([])
  const [suppCityStats, setSuppCityStats] = useState<any[]>([])
  const [suppStateStats, setSuppStateStats] = useState<any[]>([])

  // UI state
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleteSpaceConfirm, setDeleteSpaceConfirm] = useState<string | null>(null)
  const [deleteSupplierConfirm, setDeleteSupplierConfirm] = useState<string | null>(null)
  const [msgModal, setMsgModal] = useState<any | null>(null)
  const [msgText, setMsgText] = useState('')
  const [msgSending, setMsgSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [expandedSpace, setExpandedSpace] = useState<string | null>(null)
  const [expandedSupplier, setExpandedSupplier] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [userFilter, setUserFilter] = useState('')

  const addLog = (action: string, detail: string) => {
    const entry = { id: Date.now().toString(), action, detail, at: new Date().toISOString() }
    setLogs(prev => [entry, ...prev.slice(0, 99)])
  }

  const loadFeedbacks = async () => {
    setLoadingFb(true)
    const { data } = await supabase.from('feedbacks').select('*').order('created_at', { ascending: false })
    setFeedbacks(data || [])
    setLoadingFb(false)
  }

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
        supabase.from('spaces').select('id, host_id, name, city, state, category, status, created_at, whatsapp, instagram, website, price_per_hour, price_per_day, capacity, description').order('created_at', { ascending: false }).limit(100),
        supabase.from('suppliers').select('id, owner_id, name, category, state, cities, status, created_at, whatsapp, instagram, website, price_info, description').order('created_at', { ascending: false }).limit(100),
        supabase.from('quotes').select('id, event_type, status, created_at, guests_count, event_date, event_time, duration_hours, space_id, guest_id, host_id, message, host_response, proposed_price').order('created_at', { ascending: false }).limit(100),
        supabase.from('quotes').select('space_id, spaces(category)').limit(500),
      ])

      setStats({ totalUsers: profilesData?.length || 0, totalSpaces, totalSuppliers, totalQuotes, activeSpaces, activeSuppliers, pendingSpaces, quotesThisMonth, spacesThisMonth, usersThisMonth })
      setUsers(profilesData || [])
      setSpaces(spacesData || [])
      setSuppliers(suppliersData || [])
      setQuotes(quotesData || [])

      // Analytics
      const sCat: Record<string, number> = {}
      spacesData?.forEach((s: any) => { sCat[s.category] = (sCat[s.category] || 0) + 1 })
      setCatSpaceStats(Object.entries(sCat).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      const qCat: Record<string, number> = {}
      quotesWithSpace?.forEach((q: any) => { const c = (q.spaces as any)?.category; if (c) qCat[c] = (qCat[c] || 0) + 1 })
      setCatQuoteStats(Object.entries(qCat).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      const suppCat: Record<string, number> = {}
      suppliersData?.forEach((s: any) => { suppCat[s.category] = (suppCat[s.category] || 0) + 1 })
      setSuppCatStats(Object.entries(suppCat).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      const evtMap: Record<string, number> = {}
      quotesData?.forEach((q: any) => { evtMap[q.event_type] = (evtMap[q.event_type] || 0) + 1 })
      setEvtStats(Object.entries(evtMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      const sCityMap: Record<string, number> = {}
      const sStateMap: Record<string, number> = {}
      spacesData?.forEach((s: any) => { sCityMap[s.city] = (sCityMap[s.city] || 0) + 1; sStateMap[s.state] = (sStateMap[s.state] || 0) + 1 })
      setSpaceCityStats(Object.entries(sCityMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))
      setSpaceStateStats(Object.entries(sStateMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

      const suppCityMap: Record<string, number> = {}
      const suppStateMap: Record<string, number> = {}
      suppliersData?.forEach((s: any) => {
        suppStateMap[s.state] = (suppStateMap[s.state] || 0) + 1
        if (Array.isArray(s.cities)) s.cities.forEach((c: string) => { suppCityMap[c] = (suppCityMap[c] || 0) + 1 })
      })
      setSuppCityStats(Object.entries(suppCityMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))
      setSuppStateStats(Object.entries(suppStateMap).map(([cat, count]) => ({ cat, count })).sort((a, b) => b.count - a.count))

    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const updateSpaceStatus = async (id: string, status: string, name: string) => {
    setActionLoading(id)
    await supabase.from('spaces').update({ status }).eq('id', id)
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    addLog('Espaço', `"${name}" → ${STATUS_LABEL[status]}`)
    setActionLoading(null)
  }

  const updateSupplierStatus = async (id: string, status: string, name: string) => {
    setActionLoading(id)
    await supabase.from('suppliers').update({ status }).eq('id', id)
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, status } : s))
    addLog('Fornecedor', `"${name}" → ${STATUS_LABEL[status]}`)
    setActionLoading(null)
  }

  const deleteSupplier = async (id: string, name: string) => {
    setActionLoading(id)
    await supabase.from('suppliers').delete().eq('id', id)
    setSuppliers(prev => prev.filter(s => s.id !== id))
    addLog('Fornecedor excluído', `"${name}"`)
    setDeleteSupplierConfirm(null)
    setActionLoading(null)
  }

  const deleteSpace = async (id: string, name: string) => {
    setActionLoading(id)
    await supabase.from('spaces').delete().eq('id', id)
    setSpaces(prev => prev.filter(s => s.id !== id))
    addLog('Espaço excluído', `"${name}"`)
    setDeleteSpaceConfirm(null)
    setActionLoading(null)
  }

  const deleteUser = async (id: string, name: string) => {
    if (id === ADMIN_ID) return
    setActionLoading(id)
    await supabase.from('profiles').delete().eq('id', id)
    setUsers(prev => prev.filter(u => u.id !== id))
    addLog('Usuário excluído', name)
    setDeleteConfirm(null)
    setActionLoading(null)
  }

  const sendMessage = async () => {
    if (!msgModal || !msgText.trim()) return
    setMsgSending(true)
    // Abre WhatsApp se o usuário tiver phone, senão simula envio
    addLog('Mensagem enviada', `Para: ${msgModal.full_name || msgModal.email}`)
    setMsgSent(true)
    setMsgSending(false)
  }

  const getUserSpaces = (userId: string) => spaces.filter(s => s.host_id === userId)
  const getUserSuppliers = (userId: string) => suppliers.filter(s => s.owner_id === userId)
  const getUserQuotes = (userId: string) => quotes.filter(q => q.guest_id === userId || q.host_id === userId)
  const getSpaceOwner = (hostId: string) => users.find(u => u.id === hostId)
  const getSupplierOwner = (ownerId: string) => users.find(u => u.id === ownerId)

  const filteredUsers = users.filter(u =>
    !userFilter || u.full_name?.toLowerCase().includes(userFilter.toLowerCase()) || u.email?.toLowerCase().includes(userFilter.toLowerCase())
  )

  const Bar = ({ data, max, color = '#a3e635' }: { data: any[]; max: number; color?: string }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
            <span style={{ fontWeight: 600, color: '#2d2d2d' }}>{item.cat}</span>
            <span style={{ fontWeight: 700, color }}>{item.count}</span>
          </div>
          <div style={{ height: 7, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${max > 0 ? (item.count / max) * 100 : 0}%`, background: color, borderRadius: 100 }} />
          </div>
        </div>
      ))}
      {data.length === 0 && <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center', padding: 20 }}>Sem dados</div>}
    </div>
  )

  const Pill = ({ label, color }: { label: string; color: string }) => (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: `${color}18`, color }}>{label}</span>
  )

  const Card = ({ children, style }: any) => (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', ...style }}>{children}</div>
  )

  const tabs = [
    { key: 'overview', label: '📊 Visão geral' },
    { key: 'analytics-spaces', label: '🏢 Analytics Espaços' },
    { key: 'analytics-suppliers', label: '🛠️ Analytics Fornecedores' },
    { key: 'users', label: `👥 Usuários (${users.length})` },
    { key: 'spaces', label: `🏢 Espaços (${spaces.length})` },
    { key: 'suppliers', label: `🛠️ Fornecedores (${suppliers.length})` },
    { key: 'quotes', label: `📋 Orçamentos (${quotes.length})` },
    { key: 'logs', label: `📝 Logs (${logs.length})` },
    { key: 'feedbacks', label: `💡 Feedbacks (${feedbacks.length})` },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f4f6f8' }}>

      {/* HEADER */}
      <div style={{ background: '#111', padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, color: '#a3e635', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 2 }}>PAINEL ADMINISTRATIVO</div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Ewind Admin</h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={loadData} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 600, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, color: '#ccc', cursor: 'pointer', fontFamily: 'inherit' }}>🔄 Atualizar</button>
          <button onClick={() => goToPage('home')} style={{ padding: '7px 14px', fontSize: 12, fontWeight: 700, background: '#a3e635', border: 'none', borderRadius: 7, color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit' }}>← Site</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', overflowX: 'auto' }}>
        <div style={{ display: 'flex', minWidth: 'max-content', padding: '0 20px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key as any); if (t.key === 'feedbacks' && feedbacks.length === 0) loadFeedbacks() }}
              style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, border: 'none', background: 'none', borderBottom: tab === t.key ? '2.5px solid #a3e635' : '2.5px solid transparent', color: tab === t.key ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 28px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af', fontSize: 14 }}>Carregando...</div> : (
          <>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && stats && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 }}>
                  {[
                    { label: 'Usuários', value: stats.totalUsers, sub: `+${stats.usersThisMonth} este mês`, color: '#6366f1' },
                    { label: 'Espaços', value: stats.totalSpaces, sub: `${stats.activeSpaces} ativos`, color: '#0ea5e9' },
                    { label: 'Fornecedores', value: stats.totalSuppliers, sub: `${stats.activeSuppliers} ativos`, color: '#8b5cf6' },
                    { label: 'Orçamentos', value: stats.totalQuotes, sub: `+${stats.quotesThisMonth} este mês`, color: '#f59e0b' },
                    { label: 'Pendentes', value: stats.pendingSpaces, sub: 'aguardando aprovação', color: '#ef4444' },
                    { label: 'Novos espaços/mês', value: stats.spacesThisMonth, sub: 'este mês', color: '#10b981' },
                  ].map((k, i) => (
                    <Card key={i} style={{ padding: '16px 18px', borderLeft: `3px solid ${k.color}` }}>
                      <div style={{ fontSize: 26, fontWeight: 900, color: k.color }}>{k.value}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#2d2d2d', marginTop: 2 }}>{k.label}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{k.sub}</div>
                    </Card>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Card style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>👥 Usuários por perfil</div>
                    {['guest', 'host', 'supplier'].map(role => {
                      const count = users.filter(u => u.role === role).length
                      const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0
                      return (
                        <div key={role} style={{ marginBottom: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                            <span style={{ fontWeight: 600 }}>{STATUS_LABEL[role]}</span>
                            <span style={{ color: '#6b7280' }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 100 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: role === 'guest' ? '#6366f1' : role === 'host' ? '#0ea5e9' : '#8b5cf6', borderRadius: 100 }} />
                          </div>
                        </div>
                      )
                    })}
                  </Card>

                  <Card style={{ padding: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>🕐 Últimos cadastros</div>
                    {users.slice(0, 7).map(u => (
                      <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f9fafb' }}>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{u.full_name || '—'}</div>
                          <div style={{ fontSize: 10, color: '#9ca3af' }}>{u.email}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Pill label={STATUS_LABEL[u.role] || u.role} color={u.role === 'host' ? '#0369a1' : u.role === 'supplier' ? '#6d28d9' : '#166534'} />
                          <span style={{ fontSize: 10, color: '#9ca3af' }}>{fmt(u.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </Card>
                </div>
              </>
            )}

            {/* ── ANALYTICS ESPAÇOS ── */}
            {tab === 'analytics-spaces' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🏆 Categorias com mais cadastros</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Quais tipos de espaço mais anunciam</div>
                  <Bar data={catSpaceStats} max={catSpaceStats[0]?.count || 1} color="#0ea5e9" />
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📋 Categorias com mais orçamentos</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Quais tipos os clientes mais buscam</div>
                  <Bar data={catQuoteStats} max={catQuoteStats[0]?.count || 1} color="#a3e635" />
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📍 Top cidades — espaços</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Cidades com mais espaços cadastrados</div>
                  <Bar data={spaceCityStats.slice(0, 10)} max={spaceCityStats[0]?.count || 1} color="#f59e0b" />
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🗺️ Espaços por estado</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Distribuição geográfica</div>
                  <Bar data={spaceStateStats} max={spaceStateStats[0]?.count || 1} color="#ec4899" />
                </Card>
                <Card style={{ padding: 24, gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📊 Cadastros vs orçamentos por categoria</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Identifique gaps — muitos espaços com poucos orçamentos = pouca demanda nessa categoria</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead><tr style={{ background: '#f9fafb' }}>
                        {['Categoria', 'Espaços', 'Orçamentos', 'Média/espaço'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {catSpaceStats.map(({ cat, count }) => {
                          const qCount = catQuoteStats.find(q => q.cat === cat)?.count || 0
                          const avg = count > 0 ? (qCount / count).toFixed(1) : '0'
                          return (
                            <tr key={cat} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '9px 12px', fontSize: 13, fontWeight: 600 }}>{cat}</td>
                              <td style={{ padding: '9px 12px', fontSize: 13 }}><span style={{ fontWeight: 700, color: '#0ea5e9' }}>{count}</span></td>
                              <td style={{ padding: '9px 12px', fontSize: 13 }}><span style={{ fontWeight: 700, color: '#a3e635' }}>{qCount}</span></td>
                              <td style={{ padding: '9px 12px', fontSize: 13 }}><span style={{ fontWeight: 700, color: parseFloat(avg) >= 1 ? '#10b981' : '#f59e0b' }}>{avg}</span></td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {/* ── ANALYTICS FORNECEDORES ── */}
            {tab === 'analytics-suppliers' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🏆 Categorias com mais fornecedores</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Serviços mais ofertados</div>
                  <Bar data={suppCatStats} max={suppCatStats[0]?.count || 1} color="#8b5cf6" />
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🎉 Eventos mais solicitados</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Tipos de evento que mais geram orçamentos</div>
                  <Bar data={evtStats} max={evtStats[0]?.count || 1} color="#f59e0b" />
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📍 Top cidades — fornecedores</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Cidades com mais prestadores</div>
                  <Bar data={suppCityStats.slice(0, 10)} max={suppCityStats[0]?.count || 1} color="#f59e0b" />
                </Card>
                <Card style={{ padding: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>🗺️ Fornecedores por estado</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>Distribuição geográfica</div>
                  <Bar data={suppStateStats} max={suppStateStats[0]?.count || 1} color="#10b981" />
                </Card>
              </div>
            )}

            {/* ── USUÁRIOS ── */}
            {tab === 'users' && (
              <Card>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>👥 Todos os usuários ({filteredUsers.length})</div>
                  <input placeholder="🔍 Buscar por nome ou email..." value={userFilter} onChange={e => setUserFilter(e.target.value)}
                    style={{ padding: '7px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', width: 260 }} />
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f9fafb' }}>
                      {['Nome / Email', 'Perfil', 'Anúncios', 'Orçamentos', 'Cadastro', 'Ações'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map(u => {
                        const uSpaces = getUserSpaces(u.id)
                        const uSuppliers = getUserSuppliers(u.id)
                        const uQuotes = getUserQuotes(u.id)
                        const isExpanded = expandedUser === u.id
                        return (
                          <>
                            <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', background: isExpanded ? '#fafffe' : '#fff', cursor: 'pointer' }} onClick={() => setExpandedUser(isExpanded ? null : u.id)}>
                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {u.id === ADMIN_ID && <span style={{ fontSize: 8, background: '#a3e635', color: '#1a2e05', padding: '2px 5px', borderRadius: 100, fontWeight: 800 }}>ADMIN</span>}
                                  <div>
                                    <div style={{ fontSize: 12, fontWeight: 600 }}>{u.full_name || '—'}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <Pill label={STATUS_LABEL[u.role] || u.role} color={u.role === 'host' ? '#0369a1' : u.role === 'supplier' ? '#6d28d9' : '#166534'} />
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>
                                {uSpaces.length + uSuppliers.length > 0
                                  ? <span style={{ fontWeight: 700, color: '#2d2d2d' }}>{uSpaces.length + uSuppliers.length}</span>
                                  : <span style={{ color: '#d1d5db' }}>—</span>}
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>
                                {uQuotes.length > 0 ? <span style={{ fontWeight: 700, color: '#2d2d2d' }}>{uQuotes.length}</span> : <span style={{ color: '#d1d5db' }}>—</span>}
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 11, color: '#9ca3af' }}>{fmtFull(u.created_at)}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ display: 'flex', gap: 5, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                                  <button onClick={() => { setMsgModal(u); setMsgText(''); setMsgSent(false) }}
                                    style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#eff6ff', border: 'none', borderRadius: 5, cursor: 'pointer', color: '#1d4ed8' }}>
                                    ✉️ Msg
                                  </button>
                                  {u.id !== ADMIN_ID && (
                                    deleteConfirm === u.id ? (
                                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                        <span style={{ fontSize: 10, color: '#dc2626' }}>Confirmar?</span>
                                        <button onClick={() => deleteUser(u.id, u.full_name || u.email)} disabled={actionLoading === u.id}
                                          style={{ padding: '3px 6px', fontSize: 10, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}>Sim</button>
                                        <button onClick={() => setDeleteConfirm(null)}
                                          style={{ padding: '3px 6px', fontSize: 10, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#6b7280' }}>Não</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => setDeleteConfirm(u.id)}
                                        style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 5, cursor: 'pointer', color: '#dc2626' }}>
                                        🗑
                                      </button>
                                    )
                                  )}
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`${u.id}-exp`} style={{ background: '#f9fafb' }}>
                                <td colSpan={6} style={{ padding: '12px 20px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    <div>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Espaços anunciados</div>
                                      {uSpaces.length === 0 ? <div style={{ fontSize: 11, color: '#d1d5db' }}>Nenhum</div> : uSpaces.map(s => (
                                        <div key={s.id} style={{ fontSize: 11, marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                                          <Pill label={STATUS_LABEL[s.status] || s.status} color={STATUS_COLOR[s.status] || '#9ca3af'} />
                                          <span style={{ fontWeight: 600 }}>{s.name}</span>
                                          <span style={{ color: '#9ca3af' }}>{s.city}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Fornecedor</div>
                                      {uSuppliers.length === 0 ? <div style={{ fontSize: 11, color: '#d1d5db' }}>Nenhum</div> : uSuppliers.map(s => (
                                        <div key={s.id} style={{ fontSize: 11, marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                                          <Pill label={STATUS_LABEL[s.status] || s.status} color={STATUS_COLOR[s.status] || '#9ca3af'} />
                                          <span style={{ fontWeight: 600 }}>{s.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 6 }}>Orçamentos</div>
                                      {uQuotes.length === 0 ? <div style={{ fontSize: 11, color: '#d1d5db' }}>Nenhum</div> : uQuotes.slice(0, 3).map(q => (
                                        <div key={q.id} style={{ fontSize: 11, marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
                                          <Pill label={STATUS_LABEL[q.status] || q.status} color={STATUS_COLOR[q.status] || '#9ca3af'} />
                                          <span>{q.event_type}</span>
                                          <span style={{ color: '#9ca3af' }}>{fmt(q.created_at)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── ESPAÇOS ── */}
            {tab === 'spaces' && (
              <Card>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>🏢 Espaços ({spaces.length})</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f9fafb' }}>
                      {['Nome', 'Anunciante', 'Cidade', 'Categoria', 'Status', 'Data', 'Ações'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {spaces.map(s => {
                        const owner = getSpaceOwner(s.host_id)
                        const isExpanded = expandedSpace === s.id
                        return (
                          <>
                            <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: isExpanded ? '#fafffe' : '#fff' }} onClick={() => setExpandedSpace(isExpanded ? null : s.id)}>
                              <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600 }}>{s.name}</td>
                              <td style={{ padding: '10px 14px' }}>
                                {owner ? (
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 600 }}>{owner.full_name || '—'}</div>
                                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{owner.email}</div>
                                  </div>
                                ) : <span style={{ fontSize: 11, color: '#d1d5db' }}>—</span>}
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280' }}>{s.city}, {s.state}</td>
                              <td style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280' }}>{s.category}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <Pill label={STATUS_LABEL[s.status] || s.status} color={STATUS_COLOR[s.status] || '#9ca3af'} />
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 11, color: '#9ca3af' }}>{fmt(s.created_at)}</td>
                              <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  {s.status !== 'active' && <button onClick={() => updateSpaceStatus(s.id, 'active', s.name)} disabled={actionLoading === s.id} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#dcfce7', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#16a34a' }}>✓ Ativar</button>}
                                  {s.status === 'active' && <button onClick={() => updateSpaceStatus(s.id, 'paused', s.name)} disabled={actionLoading === s.id} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#6b7280' }}>⏸ Pausar</button>}
                                  {s.status !== 'rejected' && <button onClick={() => updateSpaceStatus(s.id, 'rejected', s.name)} disabled={actionLoading === s.id} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}>✕ Rejeitar</button>}
                                  {deleteSpaceConfirm === s.id ? (
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                      <span style={{ fontSize: 10, color: '#dc2626' }}>Excluir?</span>
                                      <button onClick={() => deleteSpace(s.id, s.name)} disabled={actionLoading === s.id} style={{ padding: '3px 6px', fontSize: 10, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}>Sim</button>
                                      <button onClick={() => setDeleteSpaceConfirm(null)} style={{ padding: '3px 6px', fontSize: 10, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#6b7280' }}>Não</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => setDeleteSpaceConfirm(s.id)} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}>🗑</button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`${s.id}-exp`} style={{ background: '#f9fafb' }}>
                                <td colSpan={7} style={{ padding: '12px 20px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, fontSize: 12 }}>
                                    {s.price_per_hour && <div><span style={{ color: '#9ca3af' }}>Preço/hora:</span> <strong>R$ {s.price_per_hour.toLocaleString('pt-BR')}</strong></div>}
                                    {s.price_per_day && <div><span style={{ color: '#9ca3af' }}>Preço/dia:</span> <strong>R$ {s.price_per_day.toLocaleString('pt-BR')}</strong></div>}
                                    {s.capacity && <div><span style={{ color: '#9ca3af' }}>Capacidade:</span> <strong>{s.capacity} pessoas</strong></div>}
                                    {s.whatsapp && <div><span style={{ color: '#9ca3af' }}>WhatsApp:</span> <strong>{s.whatsapp}</strong></div>}
                                    {s.instagram && <div><span style={{ color: '#9ca3af' }}>Instagram:</span> <strong>{s.instagram}</strong></div>}
                                    {s.description && <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#9ca3af' }}>Descrição:</span> {s.description.slice(0, 150)}{s.description.length > 150 ? '...' : ''}</div>}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── FORNECEDORES ── */}
            {tab === 'suppliers' && (
              <Card>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>🛠️ Fornecedores ({suppliers.length})</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f9fafb' }}>
                      {['Nome', 'Proprietário', 'Categoria', 'Estado', 'Status', 'Data', 'Ações'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {suppliers.map(s => {
                        const owner = getSupplierOwner(s.owner_id)
                        const isExpanded = expandedSupplier === s.id
                        return (
                          <>
                            <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6', cursor: 'pointer', background: isExpanded ? '#fafffe' : '#fff' }} onClick={() => setExpandedSupplier(isExpanded ? null : s.id)}>
                              <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600 }}>{s.name}</td>
                              <td style={{ padding: '10px 14px' }}>
                                {owner ? (
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 600 }}>{owner.full_name || '—'}</div>
                                    <div style={{ fontSize: 10, color: '#9ca3af' }}>{owner.email}</div>
                                  </div>
                                ) : <span style={{ fontSize: 11, color: '#d1d5db' }}>—</span>}
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280' }}>{s.category}</td>
                              <td style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280' }}>{s.state}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <Pill label={STATUS_LABEL[s.status] || s.status} color={STATUS_COLOR[s.status] || '#9ca3af'} />
                              </td>
                              <td style={{ padding: '10px 14px', fontSize: 11, color: '#9ca3af' }}>{fmt(s.created_at)}</td>
                              <td style={{ padding: '10px 14px' }} onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: 4 }}>
                                  {s.status !== 'active' && <button onClick={() => updateSupplierStatus(s.id, 'active', s.name)} disabled={actionLoading === s.id} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#dcfce7', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#16a34a' }}>✓ Ativar</button>}
                                  {s.status === 'active' && <button onClick={() => updateSupplierStatus(s.id, 'paused', s.name)} disabled={actionLoading === s.id} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#6b7280' }}>⏸ Pausar</button>}
                                  {s.status !== 'rejected' && <button onClick={() => updateSupplierStatus(s.id, 'rejected', s.name)} disabled={actionLoading === s.id} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}>✕ Rejeitar</button>}
                                  {deleteSupplierConfirm === s.id ? (
                                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                      <span style={{ fontSize: 10, color: '#dc2626' }}>Excluir?</span>
                                      <button onClick={() => deleteSupplier(s.id, s.name)} disabled={actionLoading === s.id} style={{ padding: '3px 6px', fontSize: 10, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}>Sim</button>
                                      <button onClick={() => setDeleteSupplierConfirm(null)} style={{ padding: '3px 6px', fontSize: 10, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#6b7280' }}>Não</button>
                                    </div>
                                  ) : (
                                    <button onClick={() => setDeleteSupplierConfirm(s.id)} style={{ padding: '3px 8px', fontSize: 10, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#dc2626' }}>🗑</button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`${s.id}-exp`} style={{ background: '#f9fafb' }}>
                                <td colSpan={7} style={{ padding: '12px 20px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10, fontSize: 12 }}>
                                    {s.price_info && <div><span style={{ color: '#9ca3af' }}>Preço:</span> <strong>{s.price_info}</strong></div>}
                                    {s.whatsapp && <div><span style={{ color: '#9ca3af' }}>WhatsApp:</span> <strong>{s.whatsapp}</strong></div>}
                                    {s.cities?.length > 0 && <div><span style={{ color: '#9ca3af' }}>Cidades:</span> <strong>{s.cities.join(', ')}</strong></div>}
                                    {s.description && <div style={{ gridColumn: '1 / -1' }}><span style={{ color: '#9ca3af' }}>Descrição:</span> {s.description.slice(0, 150)}{s.description.length > 150 ? '...' : ''}</div>}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── ORÇAMENTOS ── */}
            {tab === 'quotes' && (
              <Card>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>📋 Orçamentos ({quotes.length})</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: '#f9fafb' }}>
                      {['Evento', 'Data/Hora', 'Convidados', 'Duração', 'Status', 'Valor proposto', 'Enviado em'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '9px 14px', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {quotes.map(q => (
                        <tr key={q.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600 }}>{q.event_type}</td>
                          <td style={{ padding: '10px 14px', fontSize: 11, color: '#6b7280' }}>
                            {q.event_date ? new Date(q.event_date).toLocaleDateString('pt-BR') : '—'}
                            {q.event_time ? ` ${q.event_time.substring(0, 5)}h` : ''}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>{q.guests_count || '—'}</td>
                          <td style={{ padding: '10px 14px', fontSize: 12, color: '#6b7280' }}>{q.duration_hours ? `${q.duration_hours}h` : '—'}</td>
                          <td style={{ padding: '10px 14px' }}>
                            <Pill label={STATUS_LABEL[q.status] || q.status} color={STATUS_COLOR[q.status] || '#9ca3af'} />
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 12, color: q.proposed_price ? '#16a34a' : '#d1d5db', fontWeight: q.proposed_price ? 700 : 400 }}>
                            {q.proposed_price ? `R$ ${q.proposed_price.toLocaleString('pt-BR')}` : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: 11, color: '#9ca3af' }}>{fmtFull(q.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* ── LOGS ── */}
            {tab === 'feedbacks' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>💡 Feedbacks dos usuários</h3>
                  <button onClick={loadFeedbacks} style={{ fontSize: 12, padding: '7px 14px', background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', color: '#166534', fontWeight: 600 }}>🔄 Atualizar</button>
                </div>
                {loadingFb && <p style={{ color: '#9ca3af' }}>Carregando...</p>}
                {!loadingFb && feedbacks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>💡</div>
                    <p>Nenhum feedback recebido ainda.</p>
                  </div>
                )}
                {!loadingFb && feedbacks.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {feedbacks.map(fb => (
                      <div key={fb.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#2d2d2d' }}>{fb.user_email || 'Anônimo'}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{new Date(fb.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {fb.category && <span style={{ fontSize: 11, padding: '3px 10px', background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 100, color: '#166534', fontWeight: 600 }}>{fb.category}</span>}
                            {fb.page && <span style={{ fontSize: 11, padding: '3px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 100, color: '#1d4ed8', fontWeight: 600 }}>{fb.page}</span>}
                          </div>
                        </div>
                        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>{fb.message}</p>
                        {fb.media_urls && fb.media_urls.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                            {fb.media_urls.map((url: string, i: number) => (
                              url.includes('.mp4') || url.includes('.mov') || url.includes('.webm')
                                ? <video key={i} src={url} controls style={{ maxWidth: 240, maxHeight: 160, borderRadius: 8, border: '1px solid #e8e8e8' }} />
                                : <a key={i} href={url} target="_blank" rel="noreferrer">
                                    <img src={url} alt={`anexo ${i+1}`} style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #e8e8e8', cursor: 'pointer' }} />
                                  </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'logs' && (
              <Card>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>📝 Histórico de ações ({logs.length})</div>
                  {logs.length > 0 && <button onClick={() => setLogs([])} style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', fontFamily: 'inherit' }}>Limpar</button>}
                </div>
                {logs.length === 0 ? (
                  <div style={{ padding: 48, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    <div style={{ fontSize: 36, marginBottom: 10 }}>📋</div>
                    Nenhuma ação realizada ainda nesta sessão.<br />
                    Ative/pause espaços, exclua usuários e as ações aparecerão aqui.
                  </div>
                ) : (
                  <div style={{ padding: '8px 0' }}>
                    {logs.map(log => (
                      <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', borderBottom: '1px solid #f9fafb' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <span style={{ background: '#f3f4f6', color: '#6b7280', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{log.action}</span>
                          <span style={{ fontSize: 13, color: '#2d2d2d' }}>{log.detail}</span>
                        </div>
                        <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{fmtFull(log.at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

          </>
        )}
      </div>

      {/* MODAL MENSAGEM */}
      {msgModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => e.target === e.currentTarget && setMsgModal(null)}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800 }}>✉️ Enviar mensagem</h2>
              <button onClick={() => setMsgModal(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{msgModal.full_name || '—'}</div>
              <div style={{ color: '#6b7280' }}>{msgModal.email}</div>
            </div>

            {msgSent ? (
              <div style={{ padding: '20px', background: '#f0fdf4', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#166534' }}>Mensagem registrada!</div>
                <p style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>O contato foi registrado no histórico de logs. Para enviar por email ou WhatsApp, use o contato abaixo.</p>
                {msgModal.email && (
                  <a href={`mailto:${msgModal.email}?subject=Ewind — Contato administrativo&body=${encodeURIComponent(msgText)}`}
                    style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', background: '#a3e635', color: '#1a2e05', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                    Abrir no email →
                  </a>
                )}
                <button onClick={() => setMsgModal(null)} style={{ display: 'block', margin: '10px auto 0', fontSize: 12, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Fechar</button>
              </div>
            ) : (
              <>
                <div className="fg">
                  <label style={{ fontSize: 12 }}>Mensagem</label>
                  <textarea value={msgText} onChange={e => setMsgText(e.target.value)} rows={4} placeholder="Digite sua mensagem para este usuário..."
                    style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={sendMessage} disabled={!msgText.trim() || msgSending}
                    style={{ flex: 1, padding: 11, background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {msgSending ? 'Enviando...' : 'Registrar e abrir email'}
                  </button>
                  <button onClick={() => setMsgModal(null)}
                    style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, background: '#f9fafb', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
