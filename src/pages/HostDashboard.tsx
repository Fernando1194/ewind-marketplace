import DashboardLayout from '../components/DashboardLayout'
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
  const [tab, setTab] = useState('espacos')
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sacSubject, setSacSubject] = useState('')
  const [sacMsg, setSacMsg] = useState('')
  const [sacSent, setSacSent] = useState(false)
  const [chatMsgs, setChatMsgs] = useState([{ role: 'assistant' as const, text: 'Olá! 👋 Como posso ajudar com seu painel de espaços hoje?' }])
  const [chatInput, setChatInput] = useState('')

  const loadMySpaces = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('spaces')
      .select('id, host_id, name, city, state, category, media_urls, price_per_hour, price_per_day, capacity, status, event_types, attributes, min_hours, address, description, neighborhood, area_covered, area_uncovered, whatsapp, instagram, facebook, website, cardapio_url, created_at, updated_at')
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
      if (l.includes('plano') || l.includes('preço')) r = 'Os planos Ewind começam em R$59/mês para espaços. Novos anunciantes têm 90 dias gratuitos!'
      if (l.includes('orçamento')) r = 'Os orçamentos recebidos ficam no botão "Ver orçamentos" no topo do seu painel.'
      if (l.includes('foto') || l.includes('imagem')) r = 'Para adicionar fotos, edite seu anúncio e vá até a etapa de Fotos. Você pode adicionar até 8 imagens!'
      setChatMsgs(p => [...p, { role: 'assistant' as const, text: r }])
    }, 500)
  }

  const TABS = [
    { key: 'espacos', icon: '🏢', label: 'Meus espaços' },
    { key: 'dados', icon: '👤', label: 'Meus dados' },
    { key: 'sac', icon: '🎧', label: 'Suporte' },
    { key: 'chat', icon: '💬', label: 'Chat Ewind' },
  ]
  const TITLES: Record<string, {title:string;subtitle:string}> = {
    espacos: { title: 'Meus espaços', subtitle: 'Gerencie seus anúncios de espaços para eventos' },
    dados: { title: 'Meus dados', subtitle: 'Atualize suas informações de cadastro' },
    sac: { title: 'Central de suporte', subtitle: 'Nossa equipe responde em até 24h úteis' },
    chat: { title: 'Chat Ewind', subtitle: 'Tire dúvidas sobre a plataforma' },
  }

  return (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '3px 10px',
        borderRadius: 100, background: c.bg, color: c.color
      }}>{c.label}</span>
    )
  }

  return (
    <DashboardLayout user={user} tabs={TABS} activeTab={tab} onTabChange={setTab}
      title={TITLES[tab]?.title||''} subtitle={TITLES[tab]?.subtitle||''}
      headerAction={tab === 'espacos' ? (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => goToPage('host-quotes')} style={{ fontSize: 12, padding: '9px 16px', fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', color: '#2d2d2d', fontFamily: 'inherit' }}>📋 Ver orçamentos</button>
          <button className="btn-primary" onClick={() => goToPage('new-space')}>+ Novo espaço</button>
        </div>
      ) : tab === 'dados' ? undefined : undefined}>

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
          {sacSent ? (
            <div style={{textAlign:'center',padding:24}}><div style={{fontSize:40,marginBottom:10}}>✅</div><p style={{fontSize:14,color:'#166534',fontWeight:700}}>Mensagem enviada!</p><p style={{fontSize:13,color:'#6b7280'}}>Responderemos em até 24h.</p><button onClick={()=>{setSacSent(false);setSacSubject('');setSacMsg('')}} style={{marginTop:12,fontSize:12,color:'#5aa800',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>Enviar outra</button></div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              <div className="fg"><label>Assunto</label><select value={sacSubject} onChange={e=>setSacSubject(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e8e8e8',borderRadius:8,fontSize:14,fontFamily:'inherit',background:'#fff'}}><option value="">Selecione...</option><option>Dúvida sobre planos</option><option>Problema com orçamento</option><option>Erro no cadastro</option><option>Cobrança</option><option>Outro</option></select></div>
              <div className="fg"><label>Mensagem</label><textarea value={sacMsg} onChange={e=>setSacMsg(e.target.value)} rows={4} placeholder="Descreva o problema..." style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e8e8e8',borderRadius:8,fontSize:14,fontFamily:'inherit',resize:'vertical'}} /></div>
              <button onClick={()=>setSacSent(true)} disabled={!sacSubject||!sacMsg.trim()} className="btn-primary" style={{alignSelf:'flex-start',padding:'9px 22px'}}>📨 Enviar</button>
            </div>
          )}
        </div>
      )}
      {tab === 'chat' && (
        <div style={{maxWidth:600,background:'#fff',borderRadius:14,border:'1px solid #e8e8e8',overflow:'hidden'}}>
          <div style={{height:380,overflowY:'auto',padding:'20px'}}>
            {chatMsgs.map((m,i) => (
              <div key={i} style={{marginBottom:12,display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end',gap:8}}>
                {m.role==='assistant' && <div style={{width:30,height:30,borderRadius:'50%',background:'#a3e635',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,flexShrink:0}}>E</div>}
                <div style={{maxWidth:'78%',padding:'9px 13px',fontSize:13,lineHeight:1.55,borderRadius:m.role==='user'?'13px 13px 4px 13px':'13px 13px 13px 4px',background:m.role==='user'?'#a3e635':'#f3f4f6',color:m.role==='user'?'#1a2e05':'#2d2d2d'}}>{m.text}</div>
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid #e8e8e8',padding:'10px 14px',display:'flex',gap:8}}>
            <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder="Escreva sua dúvida..." style={{flex:1,padding:'9px 13px',border:'1.5px solid #e8e8e8',borderRadius:9,fontSize:13,fontFamily:'inherit'}} />
            <button onClick={sendChat} disabled={!chatInput.trim()} style={{padding:'9px 16px',background:'#a3e635',color:'#1a2e05',border:'none',borderRadius:9,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Enviar</button>
          </div>
        </div>
      )}

      {tab === 'espacos' && <div>
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
                  {!s.whatsapp && (
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 10px', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                      ⚠️ Sem WhatsApp —{' '}
                      <span onClick={() => { goToPage('edit-space', s) }} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#dc2626' }}>
                        adicionar agora para receber leads
                      </span>
                    </div>
                  )}
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
    </div>}
    </DashboardLayout>
  )
}
