import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Supplier } from '../types'
import { SUPPLIER_CATEGORIES } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page, supplier?: Supplier) => void
}

export default function SupplierDashboard({ user, goToPage }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setSuppliers(data)
    setLoading(false)
  }, [user.id])

  useEffect(() => { load() }, [load])

  const togglePause = useCallback(async (s: Supplier) => {
    const newStatus = s.status === 'active' ? 'paused' : 'active'
    const { error } = await supabase.from('suppliers').update({ status: newStatus }).eq('id', s.id)
    if (!error) setSuppliers(prev => prev.map(x => x.id === s.id ? { ...x, status: newStatus as any } : x))
  }, [])

  const deleteSupplier = useCallback(async (id: string) => {
    if (!confirm('Excluir este serviço? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (!error) setSuppliers(prev => prev.filter(x => x.id !== id))
  }, [])

  const stats = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    paused: suppliers.filter(s => s.status === 'paused').length,
  }), [suppliers])

  const statusBadge = (status: string) => {
    const cfg: Record<string, { bg: string; color: string; label: string }> = {
      active: { bg: '#f0fdf4', color: '#166534', label: 'Ativo' },
      paused: { bg: '#f3f4f6', color: '#4b5563', label: 'Pausado' },
      pending: { bg: '#fff7ed', color: '#c05621', label: 'Em revisão' }
    }
    const c = cfg[status] || cfg.pending
    return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: c.bg, color: c.color }}>{c.label}</span>
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Meus serviços</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Gerencie seus anúncios de fornecedor</p>
        </div>
        <button className="btn-primary" onClick={() => goToPage('new-supplier')}>+ Anunciar novo serviço</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-num">{stats.total}</div><div className="stat-lab2">Total</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#5aa800' }}>{stats.active}</div><div className="stat-lab2">Ativos</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#6b7280' }}>{stats.paused}</div><div className="stat-lab2">Pausados</div></div>
      </div>

      {loading && <p style={{ color: '#6b7280', fontSize: 14 }}>Carregando...</p>}

      {!loading && suppliers.length === 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛠️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Você ainda não anunciou nenhum serviço</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Cadastre seu serviço e apareça para quem está organizando eventos!</p>
          <button className="btn-primary" onClick={() => goToPage('new-supplier')}>+ Anunciar meu serviço</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {suppliers.map(s => {
          const cat = SUPPLIER_CATEGORIES.find(c => c.name === s.category)
          return (
            <div key={s.id} className="card">
              <img
                src={s.media_urls[0] || 'https://via.placeholder.com/400x160?text=Sem+foto'}
                alt={s.name}
                style={{ height: 150, width: '100%', objectFit: 'cover' }}
              />
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div className="card-name">{s.name}</div>
                    <div style={{ fontSize: 12, color: '#5aa800', fontWeight: 600 }}>{cat?.icon} {s.category}</div>
                  </div>
                  {statusBadge(s.status)}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
                  📍 {s.cities.slice(0, 2).join(', ')}{s.cities.length > 2 ? ` +${s.cities.length - 2}` : ''}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => goToPage('supplier-detail', s)}
                    style={{ flex: 1, minWidth: 60, padding: 7, fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer' }}
                  >👁 Ver</button>
                  <button
                    onClick={() => goToPage('edit-supplier', s)}
                    style={{ flex: 1, minWidth: 60, padding: 7, fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #a3e635', borderRadius: 8, cursor: 'pointer', color: '#5aa800' }}
                  >✏️ Editar</button>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button
                    onClick={() => togglePause(s)}
                    style={{ flex: 1, padding: 7, fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer' }}
                  >{s.status === 'active' ? '⏸ Pausar' : '▶ Ativar'}</button>
                  <button
                    onClick={() => deleteSupplier(s.id)}
                    style={{ padding: '7px 12px', fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #fecaca', borderRadius: 8, cursor: 'pointer', color: '#991b1b' }}
                  >🗑</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
