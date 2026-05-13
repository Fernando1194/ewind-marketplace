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

  // Feedback states
  const [showFeedback, setShowFeedback] = useState(false)
  const [fbCategory, setFbCategory] = useState('')
  const [fbPage, setFbPage] = useState('')
  const [fbMessage, setFbMessage] = useState('')
  const [fbFiles, setFbFiles] = useState<File[]>([])
  const [fbSending, setFbSending] = useState(false)
  const [fbSent, setFbSent] = useState(false)
  const [fbError, setFbError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const PAGES_LIST = ['Página inicial','Listagem de espaços','Listagem de fornecedores','Detalhe de espaço','Detalhe de fornecedor','Formulário de orçamento','Meu painel','Cadastro','Login','Outra']
  const EVENT_CATS = ['Casamento','Aniversário','Confraternização corporativa','Formatura','Chá de bebê / revelação','Show / Evento cultural','Outro']

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
    if (!confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')) return
    const { error } = await supabase.from('suppliers').delete().eq('id', id)
    if (!error) setSuppliers(prev => prev.filter(s => s.id !== id))
  }, [])

  const stats = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter(s => s.status === 'active').length,
    pending: suppliers.filter(s => s.status === 'pending').length,
    paused: suppliers.filter(s => s.status === 'paused').length,
  }), [suppliers])

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; color: string; label: string }> = {
      active:   { bg: '#f0fdf4', color: '#166534', label: 'Ativo' },
      pending:  { bg: '#fff7ed', color: '#c05621', label: 'Em revisão' },
      paused:   { bg: '#f3f4f6', color: '#4b5563', label: 'Pausado' },
      rejected: { bg: '#fef2f2', color: '#991b1b', label: 'Rejeitado' },
    }
    const c = config[status] || config.pending
    return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: c.bg, color: c.color }}>{c.label}</span>
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
      setFbError(err.message || 'Erro ao enviar. Tente novamente.')
    }
    setFbSending(false)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            Olá, {user.user_metadata?.full_name || user.email?.split('@')[0]} 👋
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Gerencie seus serviços anunciados</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowFeedback(!showFeedback)}
            style={{ fontSize: 12, padding: '9px 16px', fontWeight: 600, background: showFeedback ? '#fefce8' : '#fff', border: `1.5px solid ${showFeedback ? '#fde68a' : '#e8e8e8'}`, borderRadius: 8, cursor: 'pointer', color: showFeedback ? '#92400e' : '#2d2d2d', fontFamily: 'inherit' }}>
            💡 {showFeedback ? 'Fechar feedback' : 'Enviar feedback'}
          </button>
          <button onClick={() => goToPage('host-quotes')}
            style={{ fontSize: 12, padding: '9px 16px', fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', color: '#2d2d2d', fontFamily: 'inherit' }}>
            📋 Ver orçamentos
          </button>
          <button className="btn-primary" onClick={() => goToPage('new-supplier')}>
            + Anunciar novo serviço
          </button>
        </div>
      </div>

      {/* Feedback Panel */}
      {showFeedback && (
        <div style={{ marginBottom: 24, background: '#fff', borderRadius: 14, border: '1px solid #fde68a', padding: 24 }}>
          {fbSent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💡</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#166534', marginBottom: 6 }}>Feedback enviado!</h3>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Obrigado por ajudar a melhorar o Ewind!</p>
              <button onClick={() => { setFbSent(false); setFbCategory(''); setFbPage(''); setFbMessage(''); setFbFiles([]) }}
                style={{ fontSize: 13, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Enviar outro feedback</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 600 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>💡 Enviar feedback sobre o Ewind</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <div className="fg" style={{ flex: 1, minWidth: 200 }}>
                  <label>Categoria do evento</label>
                  <select value={fbCategory} onChange={e => setFbCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
                    <option value="">Selecione...</option>
                    {EVENT_CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="fg" style={{ flex: 1, minWidth: 200 }}>
                  <label>Onde aconteceu?</label>
                  <select value={fbPage} onChange={e => setFbPage(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fff' }}>
                    <option value="">Página...</option>
                    {PAGES_LIST.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="fg">
                <label>Seu feedback *</label>
                <textarea value={fbMessage} onChange={e => setFbMessage(e.target.value)} rows={4}
                  placeholder="Descreva o problema, sugestão ou experiência..."
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={addFiles} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '8px 16px', border: '2px dashed #d1d5db', borderRadius: 8, background: '#f9fafb', color: '#6b7280', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  📷 Adicionar prints ou vídeos (até 5)
                </button>
                {fbFiles.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {fbFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 6, fontSize: 11 }}>
                        {f.type.startsWith('video') ? '🎥' : '🖼️'}
                        <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <button onClick={() => setFbFiles(prev => prev.filter((_,j) => j !== i))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 14, lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {fbError && <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: '6px 10px', borderRadius: 6 }}>{fbError}</div>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={sendFeedback} disabled={fbSending || !fbMessage.trim()} className="btn-primary" style={{ padding: '9px 22px', fontSize: 13 }}>
                  {fbSending ? 'Enviando...' : '📨 Enviar feedback'}
                </button>
                <button onClick={() => setShowFeedback(false)}
                  style={{ padding: '9px 16px', fontSize: 13, background: 'none', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-num">{stats.total}</div><div className="stat-lab2">Total</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#5aa800' }}>{stats.active}</div><div className="stat-lab2">Ativos</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#c05621' }}>{stats.pending}</div><div className="stat-lab2">Em revisão</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#6b7280' }}>{stats.paused}</div><div className="stat-lab2">Pausados</div></div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Meus serviços</h2>

      {loading && <p>Carregando...</p>}

      {!loading && suppliers.length === 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛠️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Você ainda não cadastrou nenhum serviço</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>Cadastre seu serviço e apareça para quem está organizando eventos!</p>
          <button className="btn-primary" onClick={() => goToPage('new-supplier')}>+ Cadastrar primeiro serviço</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {suppliers.map(s => (
          <div key={s.id} className="card">
            <img
              src={s.media_urls?.[0] || 'https://via.placeholder.com/400x180?text=Sem+foto'}
              alt={s.name}
              style={{ height: 160, width: '100%', objectFit: 'cover' }}
            />
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div className="card-name">{s.name}</div>
                  <div className="card-loc">🛠️ {s.category}</div>
                  {!s.whatsapp && (
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '5px 10px', fontSize: 11, color: '#dc2626', fontWeight: 600 }}>
                      ⚠️ Sem WhatsApp — <span onClick={() => goToPage('edit-supplier', s)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>adicionar agora</span>
                    </div>
                  )}
                </div>
                {statusBadge(s.status)}
              </div>

              <div className="card-foot" style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Preços a partir de</span>
                <span className="card-price">{s.price_info || 'Consulte'}</span>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                <button onClick={() => goToPage('supplier-detail', s)}
                  style={{ flex: 1, minWidth: 70, padding: 7, fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', color: '#2d2d2d' }}>
                  👁 Ver
                </button>
                <button onClick={() => goToPage('edit-supplier', s)}
                  style={{ flex: 1, minWidth: 70, padding: 7, fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #a3e635', borderRadius: 8, cursor: 'pointer', color: '#5aa800' }}>
                  ✏️ Editar
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button onClick={() => togglePause(s)}
                  style={{ flex: 1, padding: 7, fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', color: '#2d2d2d' }}>
                  {s.status === 'active' ? '⏸ Pausar' : '▶ Ativar'}
                </button>
                <button onClick={() => deleteSupplier(s.id)}
                  style={{ padding: '7px 12px', fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #fecaca', borderRadius: 8, cursor: 'pointer', color: '#991b1b' }}>
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
