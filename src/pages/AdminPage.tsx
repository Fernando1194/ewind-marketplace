import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

interface Stats {
  totalUsers: number
  totalSpaces: number
  totalSuppliers: number
  totalQuotes: number
  activeSpaces: number
  activeSuppliers: number
  pendingSpaces: number
  quotesThisMonth: number
  usersThisMonth: number
  spacesThisMonth: number
}

interface UserRow {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface SpaceRow {
  id: string
  name: string
  city: string
  state: string
  category: string
  status: string
  created_at: string
  host_email?: string
}

interface QuoteRow {
  id: string
  event_type: string
  status: string
  created_at: string
  space_name?: string
  guest_email?: string
}

const ADMIN_ID = '17ce4a1d-a693-4902-b4ee-b03b3a288914'

export default function AdminPage({ goToPage }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'spaces' | 'suppliers' | 'quotes'>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<UserRow[]>([])
  const [spaces, setSpaces] = useState<SpaceRow[]>([])
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadStats = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [
        { count: totalSpaces },
        { count: totalSuppliers },
        { count: totalQuotes },
        { count: activeSpaces },
        { count: activeSuppliers },
        { count: pendingSpaces },
        { count: quotesThisMonth },
        { count: spacesThisMonth },
        { data: profilesData },
        { data: profilesThisMonth },
      ] = await Promise.all([
        supabase.from('spaces').select('*', { count: 'exact', head: true }),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }),
        supabase.from('quotes').select('*', { count: 'exact', head: true }),
        supabase.from('spaces').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('suppliers').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('spaces').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('quotes').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
        supabase.from('spaces').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
        supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
      ])

      setStats({
        totalUsers: profilesData?.length || 0,
        totalSpaces: totalSpaces || 0,
        totalSuppliers: totalSuppliers || 0,
        totalQuotes: totalQuotes || 0,
        activeSpaces: activeSpaces || 0,
        activeSuppliers: activeSuppliers || 0,
        pendingSpaces: pendingSpaces || 0,
        quotesThisMonth: quotesThisMonth || 0,
        usersThisMonth: profilesThisMonth || 0,
        spacesThisMonth: spacesThisMonth || 0,
      })

      setUsers(profilesData || [])

      // Load spaces with status
      const { data: spacesData } = await supabase
        .from('spaces')
        .select('id, name, city, state, category, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      setSpaces(spacesData || [])

      // Load suppliers
      const { data: suppliersData } = await supabase
        .from('suppliers')
        .select('id, name, category, state, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50)
      setSuppliers(suppliersData || [])

      // Load quotes
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('id, event_type, status, created_at, guests_count, event_date')
        .order('created_at', { ascending: false })
        .limit(50)
      setQuotes(quotesData || [])

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

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

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  const fmtDateTime = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  const statusColor: Record<string, string> = {
    active: '#16a34a', pending: '#d97706', paused: '#6b7280', rejected: '#dc2626',
    responded: '#2563eb', accepted: '#16a34a', closed: '#6b7280', viewed: '#7c3aed'
  }
  const statusLabel: Record<string, string> = {
    active: 'Ativo', pending: 'Pendente', paused: 'Pausado', rejected: 'Rejeitado',
    guest: 'Visitante', host: 'Host', supplier: 'Fornecedor',
    responded: 'Respondido', accepted: 'Aceito', closed: 'Fechado', viewed: 'Visto'
  }

  const tabs = [
    { key: 'overview', label: '📊 Visão geral' },
    { key: 'users', label: '👥 Usuários' },
    { key: 'spaces', label: '🏢 Espaços' },
    { key: 'suppliers', label: '🛠️ Fornecedores' },
    { key: 'quotes', label: '📋 Orçamentos' },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f4f6f8' }}>

      {/* HEADER */}
      <div style={{ background: '#1a1a1a', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#a3e635', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            PAINEL ADMINISTRATIVO
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>Ewind Admin</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={loadStats} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
            🔄 Atualizar
          </button>
          <button onClick={() => goToPage('home')} style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, background: '#a3e635', border: 'none', borderRadius: 8, color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit' }}>
            ← Site
          </button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8', padding: '0 32px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 0, minWidth: 'max-content' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', borderBottom: activeTab === tab.key ? '3px solid #a3e635' : '3px solid transparent', color: activeTab === tab.key ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Carregando dados...</div>
        ) : (

          <>
            {/* ===== VISÃO GERAL ===== */}
            {activeTab === 'overview' && stats && (
              <>
                {/* KPIs principais */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                  {[
                    { label: 'Usuários cadastrados', value: stats.totalUsers, sub: `+${stats.usersThisMonth} este mês`, icon: '👥', color: '#6366f1' },
                    { label: 'Espaços cadastrados', value: stats.totalSpaces, sub: `${stats.activeSpaces} ativos`, icon: '🏢', color: '#0ea5e9' },
                    { label: 'Fornecedores', value: stats.totalSuppliers, sub: `${stats.activeSuppliers} ativos`, icon: '🛠️', color: '#8b5cf6' },
                    { label: 'Orçamentos enviados', value: stats.totalQuotes, sub: `${stats.quotesThisMonth} este mês`, icon: '📋', color: '#f59e0b' },
                    { label: 'Espaços ativos', value: stats.activeSpaces, sub: `${stats.pendingSpaces} pendentes`, icon: '✅', color: '#10b981' },
                    { label: 'Novos espaços/mês', value: stats.spacesThisMonth, sub: 'este mês', icon: '📈', color: '#ec4899' },
                  ].map((kpi, i) => (
                    <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', border: '1px solid #e8e8e8', borderLeft: `4px solid ${kpi.color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontSize: 28 }}>{kpi.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: kpi.color, background: `${kpi.color}15`, padding: '3px 8px', borderRadius: 100 }}>
                          {kpi.sub}
                        </div>
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 900, color: '#2d2d2d', marginBottom: 4 }}>{kpi.value}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{kpi.label}</div>
                    </div>
                  ))}
                </div>

                {/* Breakdown por role */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e8e8e8' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>👥 Usuários por perfil</h3>
                    {['guest', 'host', 'supplier'].map(role => {
                      const count = users.filter(u => u.role === role).length
                      const pct = stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0
                      return (
                        <div key={role} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
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

                  <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e8e8e8' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏢 Espaços por status</h3>
                    {['active', 'pending', 'paused', 'rejected'].map(status => {
                      const count = spaces.filter(s => s.status === status).length
                      const pct = stats.totalSpaces > 0 ? Math.round((count / stats.totalSpaces) * 100) : 0
                      return (
                        <div key={status} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, color: statusColor[status] }}>{statusLabel[status]}</span>
                            <span style={{ color: '#6b7280' }}>{count} ({pct}%)</span>
                          </div>
                          <div style={{ height: 6, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: statusColor[status], borderRadius: 100 }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Últimos cadastros */}
                <div style={{ background: '#fff', borderRadius: 14, padding: 24, border: '1px solid #e8e8e8' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🕐 Últimos usuários cadastrados</h3>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        {['Nome', 'Email', 'Perfil', 'Data'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 8).map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                          <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>{u.full_name || '—'}</td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: '#6b7280' }}>{u.email}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 100, background: u.role === 'host' ? '#e0f2fe' : u.role === 'supplier' ? '#f3e8ff' : '#f0fdf4', color: u.role === 'host' ? '#0369a1' : u.role === 'supplier' ? '#6d28d9' : '#166534' }}>
                              {statusLabel[u.role] || u.role}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 12, color: '#9ca3af' }}>{fmtDate(u.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ===== USUÁRIOS ===== */}
            {activeTab === 'users' && (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>👥 Todos os usuários ({users.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Nome', 'Email', 'Perfil', 'Cadastro'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>
                            {u.id === ADMIN_ID && <span style={{ fontSize: 10, background: '#a3e635', color: '#1a2e05', padding: '2px 6px', borderRadius: 100, marginRight: 6, fontWeight: 800 }}>ADMIN</span>}
                            {u.full_name || '—'}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{u.email}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: u.role === 'host' ? '#e0f2fe' : u.role === 'supplier' ? '#f3e8ff' : '#f0fdf4', color: u.role === 'host' ? '#0369a1' : u.role === 'supplier' ? '#6d28d9' : '#166534' }}>
                              {statusLabel[u.role] || u.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af' }}>{fmtDateTime(u.created_at)}</td>
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
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>🏢 Espaços ({spaces.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Nome', 'Cidade', 'Categoria', 'Status', 'Cadastro', 'Ações'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {spaces.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, maxWidth: 200 }}>{s.name}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{s.city}, {s.state}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{s.category}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: `${statusColor[s.status]}15`, color: statusColor[s.status] }}>
                              {statusLabel[s.status] || s.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af' }}>{fmtDate(s.created_at)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {s.status !== 'active' && (
                                <button onClick={() => updateSpaceStatus(s.id, 'active')} disabled={actionLoading === s.id}
                                  style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, background: '#dcfce7', border: 'none', borderRadius: 6, color: '#16a34a', cursor: 'pointer' }}>
                                  ✓ Ativar
                                </button>
                              )}
                              {s.status === 'active' && (
                                <button onClick={() => updateSpaceStatus(s.id, 'paused')} disabled={actionLoading === s.id}
                                  style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 6, color: '#6b7280', cursor: 'pointer' }}>
                                  ⏸ Pausar
                                </button>
                              )}
                              {s.status !== 'rejected' && (
                                <button onClick={() => updateSpaceStatus(s.id, 'rejected')} disabled={actionLoading === s.id}
                                  style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 6, color: '#dc2626', cursor: 'pointer' }}>
                                  ✕ Rejeitar
                                </button>
                              )}
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
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>🛠️ Fornecedores ({suppliers.length})</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb' }}>
                        {['Nome', 'Categoria', 'Estado', 'Status', 'Cadastro', 'Ações'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {suppliers.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{s.name}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{s.category}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{s.state}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: `${statusColor[s.status] || '#9ca3af'}15`, color: statusColor[s.status] || '#9ca3af' }}>
                              {statusLabel[s.status] || s.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af' }}>{fmtDate(s.created_at)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {s.status !== 'active' && (
                                <button onClick={() => updateSupplierStatus(s.id, 'active')} disabled={actionLoading === s.id}
                                  style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, background: '#dcfce7', border: 'none', borderRadius: 6, color: '#16a34a', cursor: 'pointer' }}>
                                  ✓ Ativar
                                </button>
                              )}
                              {s.status === 'active' && (
                                <button onClick={() => updateSupplierStatus(s.id, 'paused')} disabled={actionLoading === s.id}
                                  style={{ padding: '4px 10px', fontSize: 11, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 6, color: '#6b7280', cursor: 'pointer' }}>
                                  ⏸ Pausar
                                </button>
                              )}
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
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700 }}>📋 Orçamentos ({quotes.length})</h3>
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
                          <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>{q.event_type}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13, color: '#6b7280' }}>{(q as any).guests_count || '—'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>{(q as any).event_date ? new Date((q as any).event_date).toLocaleDateString('pt-BR') : '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: `${statusColor[q.status] || '#9ca3af'}20`, color: statusColor[q.status] || '#9ca3af' }}>
                              {statusLabel[q.status] || q.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#9ca3af' }}>{fmtDateTime(q.created_at)}</td>
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
