import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Supplier } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page, supplier?: Supplier) => void
}

export default function SupplierDashboard({ user, goToPage }: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [fbCategory, setFbCategory] = useState('')
  const [fbPage2, setFbPage2] = useState('')
  const [fbMessage, setFbMessage] = useState('')
  const [fbFiles, setFbFiles] = useState<File[]>([])
  const [fbSending, setFbSending] = useState(false)
  const [fbSent, setFbSent] = useState(false)
  const [fbError, setFbError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('suppliers').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
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
    if (!confirm('Tem certeza?')) return
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (!error) setSuppliers(prev => prev.filter(s => s.id !== id))
  }, [])

  const stats = useMemo(() => ({ total: suppliers.length, active: suppliers.filter(s => s.status === 'active').length, pending: suppliers.filter(s => s.status === 'pending').length, paused: suppliers.filter(s => s.status === 'paused').length }), [suppliers])

  const statusBadge = (status: string) => {
    const cfg: Record<string,{bg:string;color:string;label:string}> = { active:{bg:'#f0fdf4',color:'#166534',label:'Ativo'}, pending:{bg:'#fff7ed',color:'#c05621',label:'Em revisão'}, paused:{bg:'#f3f4f6',color:'#4b5563',label:'Pausado'}, rejected:{bg:'#fef2f2',color:'#991b1b',label:'Rejeitado'} }
    const c = cfg[status] || cfg.pending
    return <span style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:100,background:c.bg,color:c.color}}>{c.label}</span>
  }

  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 28px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:800,marginBottom:4}}>Olá, {user.user_metadata?.full_name || user.email?.split('@')[0]} 👋</h1>
          <p style={{fontSize:14,color:'#6b7280'}}>Gerencie seus serviços anunciados</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={() => goToPage('host-quotes')} style={{fontSize:12,padding:'9px 16px',fontWeight:600,background:'#fff',border:'1.5px solid #e8e8e8',borderRadius:8,cursor:'pointer',color:'#2d2d2d',fontFamily:'inherit'}}>📋 Ver orçamentos</button>
          <button className="btn-primary" onClick={() => goToPage('new-supplier')}>+ Anunciar novo serviço</button>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:12,marginBottom:28}}>
        <div className="stat-card"><div className="stat-num">{stats.total}</div><div className="stat-lab2">Total</div></div>
        <div className="stat-card"><div className="stat-num" style={{color:'#5aa800'}}>{stats.active}</div><div className="stat-lab2">Ativos</div></div>
        <div className="stat-card"><div className="stat-num" style={{color:'#c05621'}}>{stats.pending}</div><div className="stat-lab2">Em revisão</div></div>
        <div className="stat-card"><div className="stat-num" style={{color:'#6b7280'}}>{stats.paused}</div><div className="stat-lab2">Pausados</div></div>
      </div>

      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Meus serviços</h2>
      {loading && <p>Carregando...</p>}
      {!loading && suppliers.length === 0 && (
        <div style={{background:'#f9fafb',borderRadius:14,padding:48,textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:12}}>🛠️</div>
          <h3 style={{fontSize:18,fontWeight:700,marginBottom:6}}>Você ainda não cadastrou nenhum serviço</h3>
          <p style={{fontSize:14,color:'#6b7280',marginBottom:20}}>Cadastre seu serviço e apareça para quem está organizando eventos!</p>
          <button className="btn-primary" onClick={() => goToPage('new-supplier')}>+ Cadastrar primeiro serviço</button>
        </div>
      )}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))',gap:16}}>
        {suppliers.map(s => (
          <div key={s.id} className="card">
            <img src={s.media_urls?.[0] || 'https://via.placeholder.com/400x180?text=Sem+foto'} alt={s.name} style={{height:160,width:'100%',objectFit:'cover'}} />
            <div className="card-body">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div className="card-name">{s.name}</div>
                  <div className="card-loc">🛠️ {s.category}</div>
                </div>
                {statusBadge(s.status)}
              </div>
              <div className="card-foot" style={{marginTop:8}}>
                <span style={{fontSize:11,color:'#9ca3af',fontWeight:500}}>Preços a partir de</span>
                <span className="card-price">{s.price_info || 'Consulte'}</span>
              </div>
              <div style={{display:'flex',gap:6,marginTop:12}}>
                <button onClick={() => goToPage('supplier-detail', s)} style={{flex:1,padding:7,fontSize:12,fontWeight:600,background:'#fff',border:'1.5px solid #e8e8e8',borderRadius:8,cursor:'pointer',color:'#2d2d2d'}}>👁 Ver</button>
                <button onClick={() => goToPage('edit-supplier', s)} style={{flex:1,padding:7,fontSize:12,fontWeight:600,background:'#fff',border:'1.5px solid #a3e635',borderRadius:8,cursor:'pointer',color:'#5aa800'}}>✏️ Editar</button>
              </div>
              <div style={{display:'flex',gap:6,marginTop:6}}>
                <button onClick={() => togglePause(s)} style={{flex:1,padding:7,fontSize:12,fontWeight:600,background:'#fff',border:'1.5px solid #e8e8e8',borderRadius:8,cursor:'pointer',color:'#2d2d2d'}}>{s.status === 'active' ? '⏸ Pausar' : '▶ Ativar'}</button>
                <button onClick={() => deleteSupplier(s.id)} style={{padding:'7px 12px',fontSize:12,fontWeight:600,background:'#fff',border:'1.5px solid #fecaca',borderRadius:8,cursor:'pointer',color:'#991b1b'}}>🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
