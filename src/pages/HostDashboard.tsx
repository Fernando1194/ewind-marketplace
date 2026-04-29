import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page, space?: Space) => void
}

export default function HostDashboard({ user, goToPage }: Props) {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(true)

  const loadMySpaces = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('spaces')
      .select('id, host_id, name, city, state, category, media_urls, price_per_hour, price_per_day, capacity, status, event_types, attributes, min_hours, address, description, created_at, updated_at')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setSpaces(data)
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    loadMySpaces()
  }, [loadMySpaces])

  const deleteSpace = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este espaço? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('spaces').delete().eq('id', id)
    if (!error) setSpaces(prev => prev.filter(s => s.id !== id))
  }, [])

  const togglePause = useCallback(async (space: Space) => {
    const newStatus = space.status === 'active' ? 'paused' : 'active'
    const { error } = await supabase
      .from('spaces')
      .update({ status: newStatus })
      .eq('id', space.id)
    if (!error) {
      setSpaces(prev => prev.map(s => s.id === space.id ? { ...s, status: newStatus as any } : s))
    }
  }, [])

  const stats = useMemo(() => ({
    total: spaces.length,
    active: spaces.filter(s => s.status === 'active').length,
    pending: spaces.filter(s => s.status === 'pending').length,
    paused: spaces.filter(s => s.status === 'paused').length,
  }), [spaces])

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; color: string; label: string }> = {
      active: { bg: '#f0fdf4', color: '#166534', label: 'Ativo' },
      pending: { bg: '#fff7ed', color: '#c05621', label: 'Em revisão' },
      paused: { bg: '#f3f4f6', color: '#4b5563', label: 'Pausado' },
      rejected: { bg: '#fef2f2', color: '#991b1b', label: 'Rejeitado' }
    }
    const c = config[status] || config.pending
    return (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '3px 10px',
        borderRadius: 100, background: c.bg, color: c.color
      }}>{c.label}</span>
    )
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            Olá, {user.user_metadata?.full_name || user.email?.split('@')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Gerencie seus espaços</p>
        </div>
        <button className="btn-primary" onClick={() => goToPage('new-space')}>
          + Cadastrar novo espaço
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-num">{stats.total}</div>
          <div className="stat-lab2">Total</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#5aa800' }}>{stats.active}</div>
          <div className="stat-lab2">Ativos</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#c05621' }}>{stats.pending}</div>
          <div className="stat-lab2">Em revisão</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#6b7280' }}>{stats.paused}</div>
          <div className="stat-lab2">Pausados</div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Meus espaços</h2>

      {loading && <p>Carregando...</p>}

      {!loading && spaces.length === 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Você ainda não cadastrou nenhum espaço</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Cadastre seu primeiro espaço e comece a receber orçamentos!</p>
          <button className="btn-primary" onClick={() => goToPage('new-space')}>
            + Cadastrar primeiro espaço
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {spaces.map(s => (
          <div key={s.id} className="card">
            <img
              src={s.media_urls[0] || 'https://via.placeholder.com/400x180?text=Sem+foto'}
              alt={s.name}
              style={{ height: 160, width: '100%', objectFit: 'cover' }}
            />
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div className="card-name">{s.name}</div>
                  <div className="card-loc">📍 {s.city}, {s.state}</div>
                </div>
                {statusBadge(s.status)}
              </div>
              <div className="card-foot" style={{ marginTop: 8 }}>
                <span className="card-price">
                  {s.price_per_hour ? `R$${s.price_per_hour}/h` : `R$${s.price_per_day}/dia`}
                </span>
                <span className="card-cap">👥 {s.capacity}</span>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => goToPage('detail', s)}
                  style={{
                    flex: 1, minWidth: 70, padding: 7, fontSize: 12, fontWeight: 600,
                    background: '#fff', border: '1.5px solid #e8e8e8',
                    borderRadius: 8, cursor: 'pointer', color: '#2d2d2d'
                  }}
                >
                  👁 Ver
                </button>
                <button
                  onClick={() => goToPage('edit-space', s)}
                  style={{
                    flex: 1, minWidth: 70, padding: 7, fontSize: 12, fontWeight: 600,
                    background: '#fff', border: '1.5px solid #a3e635',
                    borderRadius: 8, cursor: 'pointer', color: '#5aa800'
                  }}
                >
                  ✏️ Editar
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  onClick={() => togglePause(s)}
                  style={{
                    flex: 1, padding: 7, fontSize: 12, fontWeight: 600,
                    background: '#fff', border: '1.5px solid #e8e8e8',
                    borderRadius: 8, cursor: 'pointer', color: '#2d2d2d'
                  }}
                >
                  {s.status === 'active' ? '⏸ Pausar' : '▶ Ativar'}
                </button>
                <button
                  onClick={() => deleteSpace(s.id)}
                  style={{
                    padding: '7px 12px', fontSize: 12, fontWeight: 600,
                    background: '#fff', border: '1.5px solid #fecaca',
                    borderRadius: 8, cursor: 'pointer', color: '#991b1b'
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
