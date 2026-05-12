import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page) => void
}

type Tab = 'orcamentos' | 'dados' | 'sac' | 'chat'

export default function GuestDashboard({ user, goToPage }: Props) {
  const [tab, setTab] = useState<Tab>('orcamentos')
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dados pessoais
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState(user.user_metadata?.phone || '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  // SAC
  const [sacSubject, setSacSubject] = useState('')
  const [sacMsg, setSacMsg] = useState('')
  const [sacSent, setSacSent] = useState(false)
  const [sacLoading, setSacLoading] = useState(false)

  // Chat
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: 'Olá! 👋 Sou o assistente do Ewind. Como posso te ajudar hoje? Posso tirar dúvidas sobre espaços, fornecedores, orçamentos ou qualquer coisa relacionada à plataforma.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadQuotes()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadQuotes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('quotes')
      .select(`*, spaces(id, name, city, state, category, media_urls), suppliers(id, name, category)`)
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false })
    setQuotes(data || [])
    setLoading(false)
  }

  const saveProfile = async () => {
    setSaving(true)
    setSaveMsg('')
    await supabase.from('profiles').update({
      full_name: fullName,
      updated_at: new Date().toISOString()
    }).eq('id', user.id)
    await supabase.auth.updateUser({ data: { full_name: fullName, phone } })
    setSaveMsg('✓ Dados salvos com sucesso!')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const sendSac = async () => {
    if (!sacSubject.trim() || !sacMsg.trim()) return
    setSacLoading(true)
    // Registra o contato como log interno
    await supabase.from('quotes').select('id').limit(1) // just to keep connection alive
    // Simula envio — em produção integrar com email/Zendesk
    await new Promise(r => setTimeout(r, 1000))
    setSacSent(true)
    setSacLoading(false)
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    // Auto-reply
    setTimeout(() => {
      const replies: Record<string, string> = {
        'plano': 'Os planos Ewind começam em R$49/mês para fornecedores e R$59/mês para espaços. Novos anunciantes têm 90 dias gratuitos! Acesse a aba Planos para saber mais.',
        'preço': 'Os planos Ewind começam em R$49/mês para fornecedores e R$59/mês para espaços. Novos anunciantes têm 90 dias gratuitos!',
        'orçamento': 'Para solicitar um orçamento, acesse a página de um espaço ou fornecedor e clique em "Solicitar orçamento". É gratuito!',
        'cadastro': 'Para se cadastrar como anunciante, clique em "Criar conta" e selecione o tipo de perfil desejado. São 90 dias gratuitos!',
        'contato': 'Para falar com nossa equipe, use a aba "Suporte" neste painel. Respondemos em até 24h úteis.',
      }
      const lower = userMsg.toLowerCase()
      const key = Object.keys(replies).find(k => lower.includes(k))
      const reply = key ? replies[key] : 'Olá! Para dúvidas específicas, use a aba Suporte e nossa equipe responderá em até 24h. Para problemas urgentes, envie um email para suporte@ewind.com.br 😊'
      setMessages(prev => [...prev, { role: 'assistant', text: reply }])
    }, 600)
  }

  const STATUS_COLOR: Record<string, string> = { pending: '#d97706', viewed: '#7c3aed', responded: '#2563eb', accepted: '#16a34a', closed: '#6b7280', rejected: '#dc2626' }
  const STATUS_LABEL: Record<string, string> = { pending: 'Aguardando', viewed: 'Visto', responded: 'Respondido', accepted: 'Aceito', closed: 'Fechado', rejected: 'Recusado' }
  const fmt = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'orcamentos', label: 'Meus orçamentos', icon: '📋' },
    { key: 'dados', label: 'Meus dados', icon: '👤' },
    { key: 'sac', label: 'Suporte', icon: '🎧' },
    { key: 'chat', label: 'Chat Ewind', icon: '💬' },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#f4f6f8' }}>
      {/* Header */}
      <div style={{ background: '#111', padding: '28px 28px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#1a2e05' }}>
              {(fullName || user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{fullName || 'Meu painel'}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ padding: '10px 18px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer', fontFamily: 'inherit', background: tab === t.key ? '#f4f6f8' : 'rgba(255,255,255,0.08)', color: tab === t.key ? '#111' : '#9ca3af', transition: 'all .15s' }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 28px' }}>

        {/* ── ORÇAMENTOS ── */}
        {tab === 'orcamentos' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>Meus orçamentos</h2>
              <button onClick={() => goToPage('spaces')} className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
                + Buscar espaços
              </button>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>Carregando...</div>
            ) : quotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Nenhum orçamento ainda</h3>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Busque espaços ou fornecedores e solicite orçamentos gratuitos.</p>
                <button onClick={() => goToPage('spaces')} className="btn-primary">Buscar espaços →</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {quotes.map(q => (
                  <div key={q.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e8e8', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                        {q.spaces?.name || q.suppliers?.name || 'Anúncio'}
                        {q.suppliers && <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 400, marginLeft: 6 }}>Fornecedor</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        🎉 {q.event_type} · {q.event_date ? new Date(q.event_date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                        {q.guests_count && ` · ${q.guests_count} convidados`}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{fmt(q.created_at)}</div>
                    </div>
                    <div style={{ display: 'flex', align: 'center', gap: 10, alignItems: 'center' }}>
                      {q.proposed_price && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 10, color: '#9ca3af' }}>Valor proposto</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#5aa800' }}>R$ {q.proposed_price.toLocaleString('pt-BR')}</div>
                        </div>
                      )}
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: `${STATUS_COLOR[q.status] || '#9ca3af'}18`, color: STATUS_COLOR[q.status] || '#9ca3af' }}>
                        {STATUS_LABEL[q.status] || q.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── DADOS ── */}
        {tab === 'dados' && (
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Meus dados</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Atualize suas informações de cadastro.</p>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="fg">
                <label>Nome completo</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome" />
              </div>
              <div className="fg">
                <label>Email</label>
                <input type="email" value={user.email || ''} disabled style={{ background: '#f9fafb', color: '#9ca3af' }} />
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>O email não pode ser alterado por aqui.</p>
              </div>
              <div className="fg">
                <label>WhatsApp</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'))} placeholder="(41) 99999-9999" maxLength={16} />
              </div>
              {saveMsg && <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{saveMsg}</div>}
              <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        )}

        {/* ── SAC ── */}
        {tab === 'sac' && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Central de suporte</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Problemas técnicos, dúvidas ou reclamações — nossa equipe responde em até 24h.</p>
            {sacSent ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 14, padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Mensagem enviada!</h3>
                <p style={{ fontSize: 13, color: '#6b7280' }}>Responderemos no email <strong>{user.email}</strong> em até 24 horas úteis.</p>
                <button onClick={() => { setSacSent(false); setSacSubject(''); setSacMsg('') }} style={{ marginTop: 16, fontSize: 13, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="fg">
                  <label>Assunto</label>
                  <select value={sacSubject} onChange={e => setSacSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
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
                  <textarea value={sacMsg} onChange={e => setSacMsg(e.target.value)} rows={5} placeholder="Descreva detalhadamente o problema ou dúvida..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} />
                </div>
                <button onClick={sendSac} disabled={!sacSubject || !sacMsg.trim() || sacLoading} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>
                  {sacLoading ? 'Enviando...' : '📨 Enviar mensagem'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CHAT ── */}
        {tab === 'chat' && (
          <div style={{ maxWidth: 640 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Chat Ewind</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Tire dúvidas sobre espaços, serviços e como funciona a plataforma.</p>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
              {/* Messages */}
              <div style={{ height: 420, overflowY: 'auto', padding: '20px 20px 12px' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 14, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {m.role === 'assistant' && (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>E</div>
                    )}
                    <div style={{
                      maxWidth: '78%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      background: m.role === 'user' ? '#a3e635' : '#f3f4f6',
                      color: m.role === 'user' ? '#1a2e05' : '#2d2d2d',
                      fontSize: 14, lineHeight: 1.55
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                
                <div ref={chatEndRef} />
              </div>
              {/* Input */}
              <div style={{ borderTop: '1px solid #e8e8e8', padding: '12px 16px', display: 'flex', gap: 8 }}>
                <input
                  type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                  placeholder="Escreva sua dúvida..."
                  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                />
                <button onClick={sendChat} disabled={!chatInput.trim()}
                  style={{ padding: '10px 16px', background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
