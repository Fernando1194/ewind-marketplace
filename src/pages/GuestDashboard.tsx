import { t, type Lang } from '../translations'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Page } from '../App'
import DashboardLayout from '../components/DashboardLayout'

interface Props { user: User; goToPage: (page: Page) => void; lang?: Lang }

const TABS_PT = [
  { key: 'orcamentos', icon: '📋', label: 'Meus orçamentos' },
  { key: 'dados', icon: '👤', label: 'Meus dados' },
  { key: 'sac', icon: '🎧', label: 'Suporte' },
  { key: 'chat', icon: '💬', label: 'Chat Ewind' },
]
const TABS_EN = [
  { key: 'orcamentos', icon: '📋', label: 'My quotes' },
  { key: 'dados', icon: '👤', label: 'My profile' },
  { key: 'sac', icon: '🎧', label: 'Support' },
  { key: 'chat', icon: '💬', label: 'Ewind Chat' },
]
const SC: Record<string, string> = { pending:'#d97706', viewed:'#7c3aed', responded:'#2563eb', accepted:'#16a34a', closed:'#6b7280', rejected:'#dc2626' }
const SL: Record<string, string> = { pending:'Aguardando', viewed:'Visto', responded:'Respondido', accepted:'Aceito', closed:'Fechado', rejected:'Recusado' }

export default function GuestDashboard({  user, goToPage, lang = 'pt' }: Props) {
  const [tab, setTab] = useState('orcamentos')
  const [quotes, setQuotes] = useState<any[]>([])
  const [loadingQ, setLoadingQ] = useState(true)
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sacSubject, setSacSubject] = useState('')
  const [sacMsg, setSacMsg] = useState('')
  const [sacSent, setSacSent] = useState(false)
  const [chatMsgs, setChatMsgs] = useState([{ role: 'assistant' as const, text: 'Olá! 👋 Sou o assistente do Ewind. Posso tirar dúvidas sobre espaços, fornecedores e como funciona a plataforma.' }])
  const [chatInput, setChatInput] = useState('')

  useEffect(() => {
    supabase.from('quotes').select('*, spaces(id,name,city,state,category), suppliers(id,name,category)')
      .eq('guest_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setQuotes(data || []); setLoadingQ(false) })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id)
    setSaveMsg('{t[lang].dash_saved}'); setSaving(false); setTimeout(() => setSaveMsg(''), 3000)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    const msg = chatInput.trim(); setChatInput('')
    setChatMsgs(p => [...p, { role: 'user' as const, text: msg }])
    setTimeout(() => {
      const l = msg.toLowerCase()
      let r = lang === 'en' ? 'For specific questions, use the Support tab. We respond within 24h! 😊' : 'Para dúvidas específicas, use a aba Suporte. Respondemos em até 24h! 😊'
      if (l.includes('plano') || l.includes('preço')) r = lang === 'en' ? 'Ewind plans start at R$49/mo. New advertisers get 90 days free!' : 'Os planos Ewind começam em R$49/mês. Novos anunciantes têm 90 dias gratuitos!'
      if (l.includes('orçamento')) r = lang === 'en' ? 'To request a quote, visit a venue or supplier and click "Request quote". It\'s free!' : 'Para solicitar orçamento, acesse um espaço ou fornecedor e clique em "Solicitar orçamento". É gratuito!'
      if (l.includes('cadastro') || l.includes('anunciar')) r = lang === 'en' ? 'To register, click "Create account" and select your profile. 90 days free!' : 'Para cadastrar, clique em "Criar conta" e selecione o perfil. São 90 dias gratuitos!'
      setChatMsgs(p => [...p, { role: 'assistant' as const, text: r }])
    }, 500)
  }

  const T: Record<string, {title:string;subtitle:string}> = {
    orcamentos: { title: t[lang].my_quotes_title, subtitle: 'Acompanhe os orçamentos que você solicitou' },
    dados: { title: t[lang].dash_my_data, subtitle: 'Atualize suas informações de cadastro' },
    sac: { title: 'Central de suporte', subtitle: 'Nossa equipe responde em até 24h úteis' },
    chat: { title: t[lang].dash_chat, subtitle: 'Tire dúvidas sobre a plataforma' },
  }

  return (
    <DashboardLayout user={user} tabs={TABS} activeTab={tab} onTabChange={setTab}
      title={T[tab]?.title||''} subtitle={T[tab]?.subtitle||''}
      headerAction={tab === 'orcamentos' ? <button className="btn-primary" onClick={() => goToPage('spaces')} style={{fontSize:13,padding:'9px 18px'}}>{lang === 'en' ? '+ Find venues' : '+ Buscar espaços'}</button> : undefined}>

      {tab === 'orcamentos' && (
        <div>
          {loadingQ && <p style={{color:'#9ca3af'}}>{t[lang].loading}</p>}
          {!loadingQ && quotes.length === 0 && (
            <div style={{textAlign:'center',padding:'60px 24px',background:'#fff',borderRadius:14,border:'1px solid #e8e8e8'}}>
              <div style={{fontSize:48,marginBottom:12}}>📋</div>
              <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{t[lang].my_quotes_none}</h3>
              <p style={{fontSize:14,color:'#6b7280',marginBottom:20}}>{lang === 'en' ? 'Find venues or suppliers and request free quotes.' : 'Busque espaços ou fornecedores e solicite orçamentos gratuitos.'}itos.</p>
              <button className="btn-primary" onClick={() => goToPage('spaces')}>{lang === 'en' ? 'Find venues →' : 'Buscar espaços →'}</button>
            </div>
          )}
          {!loadingQ && quotes.length > 0 && (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {quotes.map(q => (
                <div key={q.id} style={{background:'#fff',borderRadius:12,border:'1px solid #e8e8e8',padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,marginBottom:4}}>
                      {q.spaces?.name||q.suppliers?.name||'Anúncio'}
                      {q.suppliers && <span style={{fontSize:10,color:'#9ca3af',fontWeight:400,marginLeft:6}}>{lang === 'en' ? 'Supplier' : 'Fornecedor'}</span>}
                    </div>
                    <div style={{fontSize:12,color:'#6b7280'}}>🎉 {q.event_type}{q.event_date&&` · ${new Date(q.event_date+'T12:00:00').toLocaleDateString('pt-BR')}`}{q.guests_count&&` · ${q.guests_count} convidados`}</div>
                    <div style={{fontSize:11,color:'#9ca3af',marginTop:2}}>{new Date(q.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'})}</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    {q.proposed_price && <div style={{textAlign:'right'}}><div style={{fontSize:10,color:'#9ca3af'}}>{lang === 'en' ? 'Proposed value' : 'Valor proposto'}</div><div style={{fontSize:15,fontWeight:800,color:'#5aa800'}}>R$ {Number(q.proposed_price).toLocaleString('pt-BR')}</div></div>}
                    <span style={{fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:100,background:`${SC[q.status]||'#9ca3af'}18`,color:SC[q.status]||'#9ca3af'}}>{SL[q.status]||q.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'dados' && (
        <div style={{maxWidth:480,background:'#fff',borderRadius:14,border:'1px solid #e8e8e8',padding:28,display:'flex',flexDirection:'column',gap:16}}>
          <div className="fg"><label>{t[lang].dash_full_name}</label><input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Seu nome" /></div>
          <div className="fg"><label>{t[lang].dash_email}</label><input type="email" value={user.email||''} disabled style={{background:'#f9fafb',color:'#9ca3af'}} /><p style={{fontSize:11,color:'#9ca3af',marginTop:4}}>{lang === 'en' ? 'Email cannot be changed.' : 'O email não pode ser alterado.'}</p></div>
          <div className="fg"><label>{t[lang].dash_whatsapp}</label><input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(41) 99999-9999" maxLength={16} /></div>
          {saveMsg && <div style={{fontSize:13,color:'#16a34a',fontWeight:600}}>{saveMsg}</div>}
          <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{alignSelf:'flex-start',padding:'10px 24px'}}>{saving ? t[lang].dash_saving : t[lang].dash_save}</button>
        </div>
      )}

      {tab === 'sac' && (
        <div style={{maxWidth:540}}>
          {sacSent ? (
            <div style={{background:'#f0fdf4',border:'1px solid #a3e635',borderRadius:14,padding:40,textAlign:'center'}}>
              <div style={{fontSize:44,marginBottom:12}}>✅</div>
              <h3 style={{fontSize:18,fontWeight:700,color:'#166534',marginBottom:8}}>{t[lang].dash_sac_sent}</h3>
              <p style={{fontSize:14,color:'#6b7280'}}>{lang === 'en' ? 'We will respond to' : 'Responderemos em'} <strong>{user.email}</strong> {lang === 'en' ? 'within 24 business hours.' : 'em até 24h úteis.'}</p>
              <button onClick={()=>{setSacSent(false);setSacSubject('');setSacMsg('')}} style={{marginTop:20,fontSize:13,color:'#5aa800',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>{t[lang].dash_sac_another}</button>
            </div>
          ) : (
            <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8e8e8',padding:28,display:'flex',flexDirection:'column',gap:16}}>
              <div className="fg">
                <label>{t[lang].dash_sac_subject}</label>
                <select value={sacSubject} onChange={e=>setSacSubject(e.target.value)} style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e8e8e8',borderRadius:8,fontSize:14,fontFamily:'inherit',background:'#fff'}}>
                  <option value="">{t[lang].select_placeholder}</option>
                  <option>{lang==='en'?'Issue with quote':'Problema com orçamento'}</option><option>{lang==='en'?'Advertiser did not respond':'Anunciante não respondeu'}</option><option>{lang==='en'?'Registration error':'Erro no cadastro'}</option><option>{lang==='en'?'Question about plans':'Dúvida sobre planos'}</option><option>{lang==='en'?'Report listing':'Denúncia de anúncio'}</option><option>{lang==='en'?'Other':'Outro'}</option>
                </select>
              </div>
              <div className="fg"><label>Mensagem</label><textarea value={sacMsg} onChange={e=>setSacMsg(e.target.value)} rows={5} placeholder={lang==='en'?'Describe in detail...':'Descreva detalhadamente...'} style={{width:'100%',padding:'10px 12px',border:'1.5px solid #e8e8e8',borderRadius:8,fontSize:14,fontFamily:'inherit',resize:'vertical'}} /></div>
              <button onClick={()=>setSacSent(true)} disabled={!sacSubject||!sacMsg.trim()} className="btn-primary" style={{alignSelf:'flex-start',padding:'10px 24px'}}>{t[lang].dash_sac_send}</button>
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <div style={{maxWidth:620}}>
          <div style={{background:'#fff',borderRadius:14,border:'1px solid #e8e8e8',overflow:'hidden'}}>
            <div style={{height:400,overflowY:'auto',padding:'20px'}}>
              {chatMsgs.map((m,i) => (
                <div key={i} style={{marginBottom:14,display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start',alignItems:'flex-end',gap:8}}>
                  {m.role==='assistant' && <div style={{width:32,height:32,borderRadius:'50%',background:'#a3e635',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#1a2e05',flexShrink:0}}>E</div>}
                  <div style={{maxWidth:'78%',padding:'10px 14px',fontSize:14,lineHeight:1.55,borderRadius:m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',background:m.role==='user'?'#a3e635':'#f3f4f6',color:m.role==='user'?'#1a2e05':'#2d2d2d'}}>{m.text}</div>
                </div>
              ))}
            </div>
            <div style={{borderTop:'1px solid #e8e8e8',padding:'12px 16px',display:'flex',gap:8}}>
              <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder={t[lang].dash_chat_placeholder} style={{flex:1,padding:'10px 14px',border:'1.5px solid #e8e8e8',borderRadius:10,fontSize:14,fontFamily:'inherit'}} />
              <button onClick={sendChat} disabled={!chatInput.trim()} style={{padding:'10px 18px',background:'#a3e635',color:'#1a2e05',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontFamily:'inherit',fontSize:14}}>{t[lang].dash_chat_send}</button>
            </div>
          </div>
          <p style={{fontSize:11,color:'#9ca3af',marginTop:10}}>{lang === 'en' ? 'For technical issues, use the Support tab.' : 'Para problemas técnicos, use a aba Suporte.'}</p>
        </div>
      )}

    </DashboardLayout>
  )
}
