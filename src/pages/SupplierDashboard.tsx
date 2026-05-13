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
  const [activeSection, setActiveSection] = useState<'servicos' | 'feedback'>('servicos')
  const [fbCategory, setFbCategory] = useState('')
  const [fbPage, setFbPage] = useState('')
  const [fbMessage, setFbMessage] = useState('')
  const [fbFiles, setFbFiles] = useState<File[]>([])
  const [fbSending, setFbSending] = useState(false)
  const [fbSent, setFbSent] = useState(false)
  const [fbError, setFbError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const PAGES_LIST = ['Página inicial','Listagem de espaços','Listagem de fornecedores','Detalhe de espaço','Detalhe de fornecedor','Formulário de orçamento','Meu painel','Cadastro','Login','Outra']
  const EVENT_CATS = ['Casamento','Aniversário','Confraternização corporativa','Formatura','Chá de bebê / revelação','Show / Evento cultural','Outro']

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
      {/* Section toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e8e8e8', paddingBottom: 0 }}>
        <button onClick={() => setActiveSection('servicos')}
          style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, border: 'none', borderBottom: activeSection === 'servicos' ? '2.5px solid #a3e635' : '2.5px solid transparent', background: 'none', color: activeSection === 'servicos' ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}>
          🛠️ Meus serviços
        </button>
        <button onClick={() => setActiveSection('feedback')}
          style={{ padding: '8px 18px', fontSize: 13, fontWeight: 600, border: 'none', borderBottom: activeSection === 'feedback' ? '2.5px solid #a3e635' : '2.5px solid transparent', background: 'none', color: activeSection === 'feedback' ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}>
          💡 Feedback
        </button>
      </div>

      {/* Feedback Section */}
      {activeSection === 'feedback' && (
        <div style={{ maxWidth: 620 }}>
          {fbSent ? (
            <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 14, padding: 48, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💡</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Feedback enviado!</h3>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Obrigado por ajudar a melhorar o Ewind!</p>
              <button onClick={() => { setFbSent(false); setFbCategory(''); setFbPage(''); setFbMessage(''); setFbFiles([]) }}
                style={{ fontSize: 13, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Enviar outro feedback</button>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#92400e' }}>
                💡 Reporte bugs, sugira melhorias ou compartilhe sua experiência com o Ewind.
              </div>
              <div className="fg">
                <label>Categoria do evento <span style={{ color: '#9ca3af', fontSize: 11 }}>(opcional)</span></label>
                <select value={fbCategory} onChange={e => setFbCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                  <option value="">Selecione uma categoria...</option>
                  {EVENT_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Onde aconteceu? <span style={{ color: '#9ca3af', fontSize: 11 }}>(página)</span></label>
                <select value={fbPage} onChange={e => setFbPage(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                  <option value="">Selecione a página...</option>
                  {PAGES_LIST.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="fg">
                <label>Seu feedback *</label>
                <textarea value={fbMessage} onChange={e => setFbMessage(e.target.value)} rows={5}
                  placeholder="Descreva o problema, sugestão ou experiência..."
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{fbMessage.length}/2000 caracteres</div>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
                  📎 Anexar prints ou vídeos <span style={{ color: '#9ca3af', fontWeight: 400 }}>(até 5, máx. 20MB cada)</span>
                </label>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" onChange={addFiles} style={{ display: 'none' }} />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  style={{ padding: '10px 18px', border: '2px dashed #d1d5db', borderRadius: 10, background: '#f9fafb', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                  📷 Clique para adicionar imagens ou vídeos
                </button>
                {fbFiles.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {fbFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 8, fontSize: 12 }}>
                        {f.type.startsWith('video') ? '🎥' : '🖼️'}
                        <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                        <button onClick={() => setFbFiles(prev => prev.filter((_,j) => j !== i))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, lineHeight: 1 }}>×</button>
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

    </div>
  )
}
