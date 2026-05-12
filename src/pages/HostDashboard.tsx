import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  const [tab, setTab] = useState<'espacos' | 'dados' | 'sac' | 'chat'>('espacos')
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sacSubject, setSacSubject] = useState('')
  const [sacMsg, setSacMsg] = useState('')
  const [sacSent, setSacSent] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<{role:'user'|'assistant',text:string}[]>([{role:'assistant',text:'Olá! 👋 Sou o assistente do Ewind. Como posso ajudar com seu painel hoje?'}])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

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

  const sendSac = async () => {
    await new Promise(r => setTimeout(r, 800))
    setSacSent(true)
  }

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim(); setChatInput('')
    setChatMsgs(p => [...p, { role: 'user', text: msg }]); setChatLoading(true)
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, system: 'Você é o assistente do Ewind, marketplace de espaços para eventos em Curitiba. Responda em português, de forma amigável e concisa.', messages: [...chatMsgs.slice(-6).map(m => ({ role: m.role, content: m.text })), { role: 'user', content: msg }] })
      })
      const d = await r.json()
      setChatMsgs(p => [...p, { role: 'assistant', text: d.content?.[0]?.text || 'Tente novamente.' }])
    } catch { setChatMsgs(p => [...p, { role: 'assistant', text: 'Erro técnico. Tente novamente.' }]) }
    setChatLoading(false)
  }

  return (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '3px 10px',
        borderRadius: 100, background: c.bg, color: c.color
      }}>{c.label}</span>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            Olá, {user.user_metadata?.full_name || user.email?.split('@')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Gerencie seus espaços</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => goToPage('supplier-dashboard')} style={{ fontSize: 12, padding: '9px 16px', fontWeight: 600, background: '#f0fdf4', border: '1.5px solid #a3e635', borderRadius: 8, cursor: 'pointer', color: '#166534', fontFamily: 'inherit' }}>
            🛠️ Painel fornecedor
          </button>
          <button className="btn-primary" onClick={() => goToPage('new-space')}>
            + Cadastrar novo espaço
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e8e8e8' }}>
        {([['espacos','🏢 Meus espaços'],['dados','👤 Meus dados'],['sac','🎧 Suporte'],['chat','💬 Chat Ewind']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', borderBottom: tab === k ? '2.5px solid #a3e635' : '2.5px solid transparent', background: 'none', color: tab === k ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Tab: Dados */}
      {tab === 'dados' && (
        <div style={{ maxWidth: 480, background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Meus dados</h3>
          <div className="fg"><label>Nome completo</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
          <div className="fg"><label>Email</label><input type="email" value={user.email || ''} disabled style={{ background: '#f9fafb', color: '#9ca3af' }} /></div>
          <div className="fg"><label>WhatsApp</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(41) 99999-9999" /></div>
          {saveMsg && <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{saveMsg}</div>}
          <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '9px 22px' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      )}

      {/* Tab: SAC */}
      {tab === 'sac' && (
        <div style={{ maxWidth: 520, background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Central de suporte</h3>
          {sacSent ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <p style={{ fontSize: 14, color: '#166534', fontWeight: 700 }}>Mensagem enviada!</p>
              <p style={{ fontSize: 13, color: '#6b7280' }}>Responderemos em até 24h no email cadastrado.</p>
              <button onClick={() => { setSacSent(false); setSacSubject(''); setSacMsg('') }} style={{ marginTop: 12, fontSize: 12, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Enviar outra mensagem</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fg">
                <label>Assunto</label>
                <select value={sacSubject} onChange={e => setSacSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                  <option value="">Selecione...</option>
                  <option>Dúvida sobre planos</option>
                  <option>Problema com orçamento</option>
                  <option>Erro no cadastro de espaço</option>
                  <option>Cobrança</option>
                  <option>Outro</option>
                </select>
              </div>
              <div className="fg"><label>Mensagem</label><textarea value={sacMsg} onChange={e => setSacMsg(e.target.value)} rows={4} placeholder="Descreva o problema..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} /></div>
              <button onClick={sendSac} disabled={!sacSubject || !sacMsg.trim()} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '9px 22px' }}>📨 Enviar</button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Chat */}
      {tab === 'chat' && (
        <div style={{ maxWidth: 600, background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
          <div style={{ height: 380, overflowY: 'auto', padding: '20px 20px 12px' }}>
            {chatMsgs.map((m, i) => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end', fontWeight: 800 }}>E</div>}
                <div style={{ maxWidth: '78%', padding: '9px 13px', borderRadius: m.role === 'user' ? '13px 13px 4px 13px' : '13px 13px 13px 4px', background: m.role === 'user' ? '#a3e635' : '#f3f4f6', color: m.role === 'user' ? '#1a2e05' : '#2d2d2d', fontSize: 13, lineHeight: 1.55 }}>{m.text}</div>
              </div>
            ))}
            {chatLoading && <div style={{ display: 'flex', gap: 8 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>E</div><div style={{ background: '#f3f4f6', padding: '9px 14px', borderRadius: '13px 13px 13px 4px', fontSize: 12, color: '#9ca3af' }}>digitando...</div></div>}
            <div ref={chatEndRef} />
          </div>
          <div style={{ borderTop: '1px solid #e8e8e8', padding: '10px 14px', display: 'flex', gap: 8 }}>
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Escreva sua dúvida..." style={{ flex: 1, padding: '9px 13px', border: '1.5px solid #e8e8e8', borderRadius: 9, fontSize: 13, fontFamily: 'inherit' }} />
            <button onClick={sendChat} disabled={!chatInput.trim() || chatLoading} style={{ padding: '9px 16px', background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Enviar</button>
          </div>
        </div>
      )}

      {/* Tab: Espaços */}
      {tab === 'espacos' && <>
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
      </>
      }
    </div>
  )
}
