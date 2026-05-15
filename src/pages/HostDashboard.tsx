import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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
  const [activeSection, setActiveSection] = useState<'espacos' | 'orcamentos'>('espacos')
  const [quotes, setQuotes] = useState<any[]>([])
  const [loadingQ, setLoadingQ] = useState(false)
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [replyPrice, setReplyPrice] = useState('')
  const [replying, setReplying] = useState<string | null>(null)

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

  const loadQuotes = async () => {
    setLoadingQ(true)
    const spaceIds = spaces.map(s => s.id)
    if (spaceIds.length === 0) { setLoadingQ(false); return }
    const { data } = await supabase
      .from('quotes')
      .select('*, spaces(name, city)')
      .in('space_id', spaceIds)
      .order('created_at', { ascending: false })
    setQuotes(data || [])
    setLoadingQ(false)
  }

  const sendReply = async (quoteId: string) => {
    setReplying(quoteId)
    await supabase.from('quotes').update({
      host_response: replyText,
      proposed_price: replyPrice ? parseFloat(replyPrice) : null,
      status: 'responded',
      responded_at: new Date().toISOString()
    }).eq('id', quoteId)
    setReplyText(''); setReplyPrice('')
    setExpandedQuote(null); setReplying(null)
    loadQuotes()
  }

  const SC: Record<string,string> = { pending:'#d97706', viewed:'#7c3aed', responded:'#2563eb', accepted:'#16a34a', closed:'#6b7280', rejected:'#dc2626' }
  const SL: Record<string,string> = { pending:'Aguardando', viewed:'Visto', responded:'Respondido', accepted:'Aceito', closed:'Fechado', rejected:'Recusado' }

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; color: string; label: string }> = {
      active: { bg: '#f0fdf4', color: '#166534', label: 'Ativo' },
      pending: { bg: '#fff7ed', color: '#c05621', label: 'Em revisão' },
      paused: { bg: '#f3f4f6', color: '#4b5563', label: 'Pausado' },
      rejected: { bg: '#fef2f2', color: '#991b1b', label: 'Rejeitado' }
    }
    const c = config[status] || config.pending
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


      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #f0f0f0', marginBottom: 24 }}>
        {([
          { key: 'espacos',    label: '🏢 Meus espaços' },
          { key: 'orcamentos', label: `📋 Orçamentos${quotes.filter(q => q.status === 'pending').length > 0 ? ` (${quotes.filter(q => q.status === 'pending').length})` : ''}` }
        ] as const).map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveSection(tab.key); if (tab.key === 'orcamentos' && quotes.length === 0) loadQuotes() }}
            style={{ padding: '10px 20px', fontSize: 14, fontWeight: activeSection === tab.key ? 700 : 500, border: 'none', borderBottom: activeSection === tab.key ? '2.5px solid #a3e635' : '2.5px solid transparent', background: 'none', color: activeSection === tab.key ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit', marginBottom: -2, transition: 'all .15s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Orçamentos tab content ── */}
      {activeSection === 'orcamentos' && (
        <div>
          {loadingQ && <p style={{ color: '#9ca3af', fontSize: 14 }}>Carregando orçamentos...</p>}
          {!loadingQ && quotes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#f9fafb', borderRadius: 14 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Nenhum orçamento ainda</h3>
              <p style={{ fontSize: 14, color: '#6b7280' }}>Quando alguém solicitar um orçamento para seus espaços, aparecerá aqui.</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {quotes.map(q => (
              <div key={q.id} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: 10 }}
                  onClick={() => { setExpandedQuote(expandedQuote === q.id ? null : q.id); setReplyText(''); setReplyPrice('') }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                      {q.spaces?.name} <span style={{ color: '#6b7280', fontWeight: 400 }}>· {q.event_type}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>
                      {q.event_date && new Date(q.event_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                      {q.guests_count && ` · ${q.guests_count} convidados`}
                      {q.duration_hours && ` · ${q.duration_hours}h`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {q.proposed_price && <div style={{ fontSize: 14, fontWeight: 800, color: '#5aa800' }}>R$ {Number(q.proposed_price).toLocaleString('pt-BR')}</div>}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: `${SC[q.status] || '#9ca3af'}15`, color: SC[q.status] || '#9ca3af' }}>
                      {SL[q.status] || q.status}
                    </span>
                    <span style={{ fontSize: 16, color: '#9ca3af' }}>{expandedQuote === q.id ? '▲' : '▼'}</span>
                  </div>
                </div>
                {expandedQuote === q.id && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 18px', background: '#fafafa' }}>
                    {q.message && (
                      <div style={{ background: '#f3f4f6', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#374151', marginBottom: 14 }}>
                        💬 <strong>Mensagem:</strong> {q.message}
                      </div>
                    )}
                    {q.host_response && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14 }}>
                        ✅ <strong>Sua resposta:</strong> {q.host_response}
                        {q.proposed_price && <span style={{ marginLeft: 8, color: '#5aa800', fontWeight: 700 }}>· R$ {Number(q.proposed_price).toLocaleString('pt-BR')}</span>}
                      </div>
                    )}
                    {(q.status === 'pending' || q.status === 'viewed') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div className="fg">
                          <label>Valor proposto (R$)</label>
                          <input type="number" value={replyPrice} onChange={e => setReplyPrice(e.target.value)} placeholder="Ex: 2500" />
                        </div>
                        <div className="fg">
                          <label>Sua resposta *</label>
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3}
                            placeholder="Olá! Temos disponibilidade para a data solicitada..."
                            style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => sendReply(q.id)} disabled={!replyText.trim() || replying === q.id} className="btn-primary" style={{ padding: '9px 20px', fontSize: 13 }}>
                            {replying === q.id ? 'Enviando...' : '✉️ Enviar resposta'}
                          </button>
                          <button onClick={() => setExpandedQuote(null)} style={{ padding: '9px 16px', fontSize: 13, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Espaços tab content ── */}
      {activeSection === 'espacos' && (
        <div>
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
              src={s.media_urls[0] || 'https://placehold.co/400x180/f3f4f6/9ca3af?text=Sem+foto'}
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
        </div>
      )}

    </div>
  )
}
