import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Page } from '../App'

interface Props { user: User; goToPage: (page: Page) => void }
type Tab = 'orcamentos' | 'dados' | 'feedback' | 'sac'

const SC: Record<string,string> = { pending:'#d97706', viewed:'#7c3aed', responded:'#2563eb', accepted:'#16a34a', closed:'#6b7280', rejected:'#dc2626' }
const SL: Record<string,string> = { pending:'Aguardando', viewed:'Visto', responded:'Respondido', accepted:'Aceito', closed:'Fechado', rejected:'Recusado' }
const PAGES_LIST = ['Página inicial','Listagem de espaços','Listagem de fornecedores','Detalhe de espaço','Detalhe de fornecedor','Formulário de orçamento','Meu painel','Cadastro','Login','Outra']
const EVENT_CATS = ['Casamento','Aniversário','Confraternização corporativa','Formatura','Chá de bebê / revelação','Show / Evento cultural','Outro']

export default function GuestDashboard({ user, goToPage }: Props) {
  const [tab, setTab] = useState<Tab>('orcamentos')
  const [quotes, setQuotes] = useState<any[]>([])
  const [loadingQ, setLoadingQ] = useState(true)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [fbCategory, setFbCategory] = useState('')
  const [fbPage, setFbPage] = useState('')
  const [fbMessage, setFbMessage] = useState('')
  const [fbFiles, setFbFiles] = useState<File[]>([])
  const [fbSending, setFbSending] = useState(false)
  const [fbSent, setFbSent] = useState(false)
  const [fbError, setFbError] = useState('')
  const [sacSubject, setSacSubject] = useState('')
  const [sacMsg, setSacMsg] = useState('')
  const [sacSent, setSacSent] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const name = fullName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Visitante'

  useEffect(() => {
    supabase.from('profiles').select('full_name').eq('id', user.id).single()
      .then(({ data }) => { if (data?.full_name) setFullName(data.full_name) })
    if (user.user_metadata?.phone) setPhone(user.user_metadata.phone)
    supabase.from('quotes').select('*, spaces(id,name,city,state,category), suppliers(id,name,category)')
      .eq('guest_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setQuotes(data || []); setLoadingQ(false) })
  }, [])

  const saveProfile = async () => {
    setSaving(true); setSaveMsg('')
    const { error } = await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id)
    await supabase.auth.updateUser({ data: { full_name: fullName, phone } })
    setSaveMsg(error ? '⚠️ Erro ao salvar.' : '✓ Dados salvos com sucesso!')
    setSaving(false); setTimeout(() => setSaveMsg(''), 4000)
  }

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []).filter(f => f.size < 20 * 1024 * 1024)
    setFbFiles(prev => [...prev, ...newFiles].slice(0, 5))
    e.target.value = ''
  }

  const sendFeedback = async () => {
    if (!fbMessage.trim()) { setFbError('Descreva seu feedback antes de enviar.'); return }
    setFbSending(true); setFbError('')
    try {
      const mediaUrls: string[] = []
      for (const file of fbFiles) {
        const ext = file.name.split('.').pop()
        const path = `feedback/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data } = await supabase.storage.from('space-media').upload(path, file, { upsert: true })
        if (data) {
          const { data: { publicUrl } } = supabase.storage.from('space-media').getPublicUrl(path)
          mediaUrls.push(publicUrl)
        }
      }
      const { error } = await supabase.from('feedbacks').insert({
        user_id: user.id, user_email: user.email,
        category: fbCategory, page: fbPage,
        message: fbMessage, media_urls: mediaUrls,
      })
      if (error) throw error
      setFbSent(true)
    } catch (err: any) {
      setFbError(err.message || 'Erro ao enviar feedback. Tente novamente.')
    }
    setFbSending(false)
  }

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'orcamentos', icon: '📋', label: 'Meus orçamentos' },
    { key: 'dados',      icon: '👤', label: 'Meus dados' },
    { key: 'feedback',   icon: '💡', label: 'Feedback' },
    { key: 'sac',        icon: '🎧', label: 'Suporte' },
  ]
  const TITLES: Record<Tab,{title:string;sub:string}> = {
    orcamentos: { title:'Meus orçamentos', sub:'Acompanhe os orçamentos que você solicitou' },
    dados:      { title:'Meus dados', sub:'Atualize suas informações de cadastro' },
    feedback:   { title:'Enviar feedback', sub:'Ajude-nos a melhorar a plataforma com sua opinião' },
    sac:        { title:'Central de suporte', sub:'Nossa equipe responde em até 24h úteis' },
  }

  const sidebar = { width: 220, background: '#111' }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#f4f6f8', display: 'flex' }}>

      {/* Sidebar */}
      <div style={{ ...sidebar, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#1a2e05', flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
              <div style={{ fontSize: 10, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: '10px 0', flex: 1 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              width: '100%', textAlign: 'left', padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 10,
              background: tab === t.key ? 'rgba(163,230,53,0.12)' : 'transparent', border: 'none',
              borderLeft: tab === t.key ? '3px solid #a3e635' : '3px solid transparent',
              color: tab === t.key ? '#a3e635' : '#9ca3af', fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s'
            }}>
              <span style={{ fontSize: 15 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 10, color: '#444', textAlign: 'center' }}>Ewind · Marketplace de Eventos</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #e8e8e8', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 2 }}>{TITLES[tab].title}</h1>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{TITLES[tab].sub}</p>
          </div>
          {tab === 'orcamentos' && <button className="btn-primary" onClick={() => goToPage('listing')} style={{ fontSize: 13, padding: '9px 18px' }}>+ Buscar espaços</button>}
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* ── ORÇAMENTOS ── */}
          {tab === 'orcamentos' && (
            <div>
              {loadingQ && <p style={{ color: '#9ca3af', fontSize: 14 }}>Carregando...</p>}
              {!loadingQ && quotes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Nenhum orçamento ainda</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Busque espaços ou fornecedores e solicite orçamentos gratuitos.</p>
                  <button className="btn-primary" onClick={() => goToPage('listing')}>Buscar espaços →</button>
                </div>
              )}
              {!loadingQ && quotes.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {quotes.map(q => (
                    <div key={q.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                          {q.spaces?.name || q.suppliers?.name || 'Anúncio'}
                          {q.suppliers && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>Fornecedor</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          🎉 {q.event_type}{q.event_date && ` · ${new Date(q.event_date+'T12:00:00').toLocaleDateString('pt-BR')}`}{q.guests_count && ` · ${q.guests_count} convidados`}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{new Date(q.created_at).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'2-digit'})}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {q.proposed_price && <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: '#9ca3af' }}>Valor proposto</div><div style={{ fontSize: 15, fontWeight: 800, color: '#5aa800' }}>R$ {Number(q.proposed_price).toLocaleString('pt-BR')}</div></div>}
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: `${SC[q.status]||'#9ca3af'}18`, color: SC[q.status]||'#9ca3af' }}>{SL[q.status]||q.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── DADOS ── */}
          {tab === 'dados' && (
            <div style={{ maxWidth: 500 }}>
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className="fg">
                  <label>Nome completo</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome completo" />
                </div>
                <div className="fg">
                  <label>Email</label>
                  <input type="email" value={user.email || ''} disabled style={{ background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }} />
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>O email não pode ser alterado. Entre em contato com o suporte se necessário.</p>
                </div>
                <div className="fg">
                  <label>WhatsApp</label>
                  <input type="tel" value={phone} onChange={e => {
                    const n = e.target.value.replace(/\D/g,'').slice(0,11)
                    setPhone(n.length <= 2 ? n : n.length <= 7 ? `(${n.slice(0,2)}) ${n.slice(2)}` : `(${n.slice(0,2)}) ${n.slice(2,7)}-${n.slice(7)}`)
                  }} placeholder="(41) 99999-9999" maxLength={16} />
                </div>
                {saveMsg && <div style={{ fontSize: 13, fontWeight: 600, padding: '8px 12px', borderRadius: 8, color: saveMsg.startsWith('⚠️') ? '#dc2626' : '#16a34a', background: saveMsg.startsWith('⚠️') ? '#fef2f2' : '#f0fdf4' }}>{saveMsg}</div>}
                <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 28px', fontSize: 14 }}>
                  {saving ? 'Salvando...' : '💾 Salvar alterações'}
                </button>
              </div>
            </div>
          )}

          {/* ── FEEDBACK ── */}
          {tab === 'feedback' && (
            <div style={{ maxWidth: 620 }}>
              {fbSent ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 14, padding: 48, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Feedback enviado!</h3>
                  <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Obrigado por ajudar a melhorar o Ewind. Sua opinião é muito importante!</p>
                  <button onClick={() => { setFbSent(false); setFbCategory(''); setFbPage(''); setFbMessage(''); setFbFiles([]) }}
                    style={{ fontSize: 13, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    Enviar outro feedback
                  </button>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e' }}>
                    💡 Use este espaço para reportar bugs, sugerir melhorias ou compartilhar sua experiência com o Ewind.
                  </div>

                  {/* Categoria */}
                  <div className="fg">
                    <label>Categoria do evento <span style={{ color: '#9ca3af', fontSize: 11 }}>(opcional)</span></label>
                    <select value={fbCategory} onChange={e => setFbCategory(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                      <option value="">Selecione uma categoria...</option>
                      {EVENT_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Página */}
                  <div className="fg">
                    <label>Onde aconteceu? <span style={{ color: '#9ca3af', fontSize: 11 }}>(página do site)</span></label>
                    <select value={fbPage} onChange={e => setFbPage(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                      <option value="">Selecione a página...</option>
                      {PAGES_LIST.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* Mensagem */}
                  <div className="fg">
                    <label>Seu feedback *</label>
                    <textarea value={fbMessage} onChange={e => setFbMessage(e.target.value)} rows={5}
                      placeholder="Descreva o problema, sugestão ou experiência. Quanto mais detalhe, melhor! Exemplo: 'Ao clicar em solicitar orçamento na tela de detalhe, a página fica em branco...'"
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{fbMessage.length}/2000 caracteres</div>
                  </div>

                  {/* Upload */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                      📎 Anexar prints ou vídeos <span style={{ color: '#9ca3af', fontWeight: 400 }}>(até 5 arquivos, máx. 20MB cada)</span>
                    </label>
                    <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={addFiles} style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      style={{ padding: '10px 18px', border: '2px dashed #d1d5db', borderRadius: 10, background: '#f9fafb', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', width: '100%', transition: 'all .15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#a3e635'; (e.currentTarget as HTMLElement).style.background = '#f7ffe8' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'; (e.currentTarget as HTMLElement).style.background = '#f9fafb' }}>
                      📷 Clique para adicionar imagens ou vídeos
                    </button>

                    {fbFiles.length > 0 && (
                      <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {fbFiles.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 8, fontSize: 12 }}>
                            {f.type.startsWith('video') ? '🎥' : '🖼️'}
                            <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                            <button onClick={() => setFbFiles(prev => prev.filter((_,j) => j !== i))}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14, padding: '0 2px', lineHeight: 1 }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {fbError && <div style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: 8 }}>{fbError}</div>}

                  <button onClick={sendFeedback} disabled={fbSending || !fbMessage.trim()} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '11px 28px', fontSize: 14 }}>
                    {fbSending ? 'Enviando...' : '📨 Enviar feedback'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── SAC ── */}
          {tab === 'sac' && (
            <div style={{ maxWidth: 540 }}>
              {sacSent ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Mensagem enviada!</h3>
                  <p style={{ fontSize: 14, color: '#6b7280' }}>Responderemos em <strong>{user.email}</strong> em até 24h úteis.</p>
                  <button onClick={() => { setSacSent(false); setSacSubject(''); setSacMsg('') }}
                    style={{ marginTop: 20, fontSize: 13, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="fg">
                    <label>Assunto</label>
                    <select value={sacSubject} onChange={e => setSacSubject(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                      <option value="">Selecione o assunto...</option>
                      <option>Problema com orçamento</option>
                      <option>Anunciante não respondeu</option>
                      <option>Erro no cadastro</option>
                      <option>Dúvida sobre planos</option>
                      <option>Denúncia de anúncio</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div className="fg">
                    <label>Mensagem</label>
                    <textarea value={sacMsg} onChange={e => setSacMsg(e.target.value)} rows={5}
                      placeholder="Descreva detalhadamente o problema ou dúvida..."
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
                  </div>
                  <button onClick={() => setSacSent(true)} disabled={!sacSubject || !sacMsg.trim()} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                    📨 Enviar mensagem
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
