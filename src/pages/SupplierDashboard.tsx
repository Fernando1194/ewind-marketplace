import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  const [tab, setTab] = useState<'servicos' | 'dados' | 'sac' | 'chat'>('servicos')
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sacSubject, setSacSubject] = useState('')
  const [sacMsg, setSacMsg] = useState('')
  const [sacSent, setSacSent] = useState(false)
  const [chatMsgs, setChatMsgs] = useState<{role:'user'|'assistant',text:string}[]>([{role:'assistant',text:'Olá! 👋 Sou o assistente do Ewind. Como posso ajudar com seu painel de fornecedor hoje?'}])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

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
  const sendSac = async () => { await new Promise(r => setTimeout(r, 800)); setSacSent(true) }
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return
    const msg = chatInput.trim(); setChatInput('')
    setChatMsgs(p => [...p, { role: 'user', text: msg }]); setChatLoading(true)
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, system: 'Você é o assistente do Ewind, marketplace de espaços para eventos em Curitiba. Responda em português, de forma amigável e concisa. Ajude fornecedores com dúvidas sobre o painel, cadastro de serviços, orçamentos e planos.', messages: [...chatMsgs.slice(-6).map(m => ({ role: m.role, content: m.text })), { role: 'user', content: msg }] }) })
      const d = await r.json()
      setChatMsgs(p => [...p, { role: 'assistant', text: d.content?.[0]?.text || 'Tente novamente.' }])
    } catch { setChatMsgs(p => [...p, { role: 'assistant', text: 'Erro técnico.' }]) }
    setChatLoading(false)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e8e8e8' }}>
        {([['servicos','🛠️ Meus serviços'],['dados','👤 Meus dados'],['sac','🎧 Suporte'],['chat','💬 Chat Ewind']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, border: 'none', borderBottom: tab === k ? '2.5px solid #a3e635' : '2.5px solid transparent', background: 'none', color: tab === k ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}>
            {l}
          </button>
        ))}
      </div>

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

      {tab === 'sac' && (
        <div style={{ maxWidth: 520, background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Central de suporte</h3>
          {sacSent ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <p style={{ fontSize: 14, color: '#166534', fontWeight: 700 }}>Mensagem enviada!</p>
              <button onClick={() => { setSacSent(false); setSacSubject(''); setSacMsg('') }} style={{ marginTop: 12, fontSize: 12, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Enviar outra</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fg">
                <label>Assunto</label>
                <select value={sacSubject} onChange={e => setSacSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                  <option value="">Selecione...</option>
                  <option>Dúvida sobre planos</option><option>Problema com orçamento</option><option>Erro no cadastro</option><option>Cobrança</option><option>Outro</option>
                </select>
              </div>
              <div className="fg"><label>Mensagem</label><textarea value={sacMsg} onChange={e => setSacMsg(e.target.value)} rows={4} placeholder="Descreva o problema..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} /></div>
              <button onClick={sendSac} disabled={!sacSubject || !sacMsg.trim()} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '9px 22px' }}>📨 Enviar</button>
            </div>
          )}
        </div>
      )}

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

      {tab === 'servicos' && <>
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
      </>
      }
    </div>
  )
}
