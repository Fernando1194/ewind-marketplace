import DashboardLayout from '../components/DashboardLayout'
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
  const [tab, setTab] = useState('servicos')
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sacSubject, setSacSubject] = useState('')
  const [sacMsg, setSacMsg] = useState('')
  const [sacSent, setSacSent] = useState(false)
  const [chatMsgs, setChatMsgs] = useState([{ role: 'assistant' as const, text: 'Olá! 👋 Como posso ajudar com seu painel de fornecedor hoje?' }])
  const [chatInput, setChatInput] = useState('')

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

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id)
    setSaveMsg('✓ Salvo!'); setSaving(false); setTimeout(() => setSaveMsg(''), 3000)
  }
  const sendChat = () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim(); setChatInput('')
    setChatMsgs(p => [...p, { role: 'user' as const, text: msg }])
    setTimeout(() => {
      const l = msg.toLowerCase()
      let r = 'Para dúvidas específicas, use a aba Suporte. Respondemos em até 24h!'
      if (l.includes('plano') || l.includes('preço')) r = 'Os planos Ewind começam em R$49/mês para fornecedores. Novos anunciantes têm 90 dias gratuitos!'
      if (l.includes('orçamento')) r = 'Os orçamentos recebidos ficam no botão "Ver orçamentos" no topo do seu painel.'
      setChatMsgs(p => [...p, { role: 'assistant' as const, text: r }])
    }, 500)
  }

  const TABS = [
    { key: 'servicos', icon: '🛠️', label: 'Meus serviços' },
    { key: 'dados', icon: '👤', label: 'Meus dados' },
    { key: 'sac', icon: '🎧', label: 'Suporte' },
    { key: 'chat', icon: '💬', label: 'Chat Ewind' },
  ]
  const TITLES: Record<string, {title:string;subtitle:string}> = {
    servicos: { title: 'Meus serviços', subtitle: 'Gerencie seus anúncios de serviços' },
    dados: { title: 'Meus dados', subtitle: 'Atualize suas informações de cadastro' },
    sac: { title: 'Central de suporte', subtitle: 'Nossa equipe responde em até 24h úteis' },
    chat: { title: 'Chat Ewind', subtitle: 'Tire dúvidas sobre a plataforma' },
  }

  return (
    <DashboardLayout user={user} tabs={TABS} activeTab={tab} onTabChange={setTab}
      title={TITLES[tab]?.title||''} subtitle={TITLES[tab]?.subtitle||''}
      headerAction={tab === 'servicos' ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => goToPage('host-quotes')} style={{ fontSize: 12, padding: '9px 16px', fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', color: '#2d2d2d', fontFamily: 'inherit' }}>📋 Ver orçamentos</button>
          <button className="btn-primary" onClick={() => goToPage('new-supplier')}>+ Novo serviço</button>
        </div>
      ) : undefined}>

      {tab === 'dados' && (
        <div style={{maxWidth:480,background:'#fff',borderRadius:14,border:'1px solid #e8e8e8',padding:28,display:'flex',flexDirection:'column',gap:16}}>
          <div className="fg"><label>Nome completo</label><input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} /></div>
          <div className="fg"><label>Email</label><input type="email" value={user.email||''} disabled style={{background:'#f9fafb',color:'#9ca3af'}} /></div>
          <div className="fg"><label>WhatsApp</label><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(41) 99999-9999" /></div>
          {saveMsg && <div style={{fontSize:13,color:'#16a34a',fontWeight:600}}>{saveMsg}</div>}
          <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{alignSelf:'flex-start',padding:'10px 24px'}}>{saving?'Salvando...':'Salvar'}</button>
        </div>
      )}
      {tab === 'sac' && (
        <div style={{maxWidth:520,background:'#fff',borderRadius:14,border:'1px solid #e8e8e8',padding:28}}>
          {sacSent ? (<div style={{textAlign:'center',padding:24}}><div style={{fontSize:40,marginBottom:10}}>✅</div><p style={{fontSize:14,color:'#166534',fontWeight:700}}>Mensagem enviada!</p><button onClick={()=>{setSacSent(false);setSacSubject('');setSacMsg('')}} style={{marginTop:12,fontSize:12,color:'#5aa800',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Enviar outra</button></div>
          ) : (<div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div className="fg"><label>Assunto</label><select value={sacSubject} onChange={e=>setSacSubject(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e8e8e8',borderRadius:8,fontSize:14,fontFamily:'inherit',background:'#fff'}}><option value="">Selecione...</option><option>Dúvida sobre planos</option><option>Problema com orçamento</option><option>Erro no cadastro</option><option>Outro</option></select></div>
              <div className="fg"><label>Mensagem</label><textarea value={sacMsg} onChange={e=>setSacMsg(e.target.value)} rows={4} placeholder="Descreva..." style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e8e8e8',borderRadius:8,fontSize:14,fontFamily:'inherit',resize:'vertical'}} /></div>
              <button onClick={()=>setSacSent(true)} disabled={!sacSubject||!sacMsg.trim()} className="btn-primary" style={{alignSelf:'flex-start',padding:'9px 22px'}}>📨 Enviar</button>
            </div>)}
        </div>
      )}
      {tab === 'chat' && (
        <div style={{maxWidth:600,background:'#fff',borderRadius:14,border:'1px solid #e8e8e8',overflow:'hidden'}}>
          <div style={{height:380,overflowY:'auto',padding:'20px'}}>
            {chatMsgs.map((m,i) => (<div key={i} style={{marginBottom:12,display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end',gap:8}}>{m.role==='assistant' && <div style={{width:30,height:30,borderRadius:'50%',background:'#a3e635',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,flexShrink:0}}>E</div>}<div style={{maxWidth:'78%',padding:'9px 13px',fontSize:13,lineHeight:1.55,borderRadius:m.role==='user'?'13px 13px 4px 13px':'13px 13px 13px 4px',background:m.role==='user'?'#a3e635':'#f3f4f6',color:m.role==='user'?'#1a2e05':'#2d2d2d'}}>{m.text}</div></div>))}
          </div>
          <div style={{borderTop:'1px solid #e8e8e8',padding:'10px 14px',display:'flex',gap:8}}>
            <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Escreva sua dúvida..." style={{flex:1,padding:'9px 13px',border:'1.5px solid #e8e8e8',borderRadius:9,fontSize:13,fontFamily:'inherit'}} />
            <button onClick={sendChat} disabled={!chatInput.trim()} style={{padding:'9px 16px',background:'#a3e635',color:'#1a2e05',border:'none',borderRadius:9,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Enviar</button>
          </div>
        </div>
      )}

      {tab === 'servicos' && <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Meus serviços</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Gerencie seus anúncios de fornecedor</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => goToPage('host-quotes')} style={{ fontSize: 12, padding: '9px 16px', fontWeight: 600, background: '#f0fdf4', border: '1.5px solid #a3e635', borderRadius: 8, cursor: 'pointer', color: '#166534', fontFamily: 'inherit' }}>
            📋 Ver orçamentos recebidos
          </button>
          <button className="btn-primary" onClick={() => goToPage('new-supplier')}>+ Anunciar novo serviço</button>
        </div>
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
    </div>}
    </DashboardLayout>
  )
}
