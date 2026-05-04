import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import { QUOTE_STATUS_LABELS, EVENT_TYPES } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page) => void
}

export default function MyQuotesPage({ user, goToPage }: Props) {
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [celebrationQuote, setCelebrationQuote] = useState<any | null>(null)
  const [editingQuote, setEditingQuote] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({ event_type: '', event_date: '', event_time: '', guests_count: '', duration_hours: '', message: '' })
  const [editLoading, setEditLoading] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active')

  useEffect(() => { loadQuotes() }, [])

  const loadQuotes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('quotes')
      .select(`*, spaces (id, name, city, state, category, media_urls, price_per_hour, price_per_day, host_id, capacity, min_hours, whatsapp, instagram, website, status, created_at, updated_at)`)
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setQuotes(data as any)
    setLoading(false)
  }

  const acceptQuote = async (q: any) => {
    await supabase.from('quotes').update({ status: 'accepted' }).eq('id', q.id)
    setQuotes(prev => prev.map(x => x.id === q.id ? { ...x, status: 'accepted' } : x))
    setCelebrationQuote(q)
  }

  const cancelQuote = async (id: string) => {
    await supabase.from('quotes').update({ status: 'closed' }).eq('id', id)
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: 'closed' } : q))
    setCancelConfirm(null)
  }

  const openEdit = (q: any) => {
    setEditForm({
      event_type: q.event_type || '',
      event_date: q.event_date || '',
      event_time: q.event_time || '',
      guests_count: q.guests_count?.toString() || '',
      duration_hours: q.duration_hours?.toString() || '',
      message: q.message || ''
    })
    setEditingQuote(q)
  }

  const saveEdit = async () => {
    if (!editingQuote) return
    setEditLoading(true)
    const { error } = await supabase.from('quotes').update({
      event_type: editForm.event_type,
      event_date: editForm.event_date,
      event_time: editForm.event_time || null,
      guests_count: parseInt(editForm.guests_count),
      duration_hours: parseInt(editForm.duration_hours),
      message: editForm.message,
      status: 'pending'
    }).eq('id', editingQuote.id)
    if (!error) {
      setQuotes(prev => prev.map(q => q.id === editingQuote.id ? {
        ...q, ...editForm,
        guests_count: parseInt(editForm.guests_count),
        duration_hours: parseInt(editForm.duration_hours),
        status: 'pending'
      } : q))
      setEditingQuote(null)
    }
    setEditLoading(false)
  }

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR') : '—'
  const fmtTime = (t: string) => t ? t.substring(0, 5) : null

  const hoursAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'agora há pouco'
    if (h < 24) return `há ${h}h`
    return `há ${Math.floor(h / 24)} dia(s)`
  }

  const activeQuotes = quotes.filter(q => !['closed', 'rejected'].includes(q.status))
  const closedQuotes = quotes.filter(q => ['closed', 'rejected'].includes(q.status))
  const displayed = activeTab === 'active' ? activeQuotes : closedQuotes

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Meus orçamentos</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Acompanhe e gerencie suas solicitações</p>
        </div>
        <button className="btn-primary" onClick={() => goToPage('listing')} style={{ fontSize: 13 }}>
          + Novo orçamento
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8e8e8', marginBottom: 20 }}>
        {[
          { key: 'active', label: `Em andamento (${activeQuotes.length})` },
          { key: 'closed', label: `Encerrados (${closedQuotes.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
            style={{ padding: '10px 20px', fontSize: 13, fontWeight: 600, border: 'none', background: 'none', borderBottom: activeTab === tab.key ? '2.5px solid #a3e635' : '2.5px solid transparent', color: activeTab === tab.key ? '#2d2d2d' : '#9ca3af', cursor: 'pointer', fontFamily: 'inherit' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ color: '#6b7280', fontSize: 14 }}>Carregando orçamentos...</p>}

      {!loading && displayed.length === 0 && (
        <div style={{ background: '#f9fafb', borderRadius: 14, padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            {activeTab === 'active' ? 'Nenhum orçamento em andamento' : 'Nenhum orçamento encerrado'}
          </h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>
            {activeTab === 'active' ? 'Explore espaços e solicite seu primeiro orçamento!' : 'Orçamentos cancelados ou recusados aparecerão aqui.'}
          </p>
          {activeTab === 'active' && <button className="btn-primary" onClick={() => goToPage('listing')}>Explorar espaços</button>}
        </div>
      )}

      <div style={{ display: 'grid', gap: 14 }}>
        {displayed.map(q => {
          const status = QUOTE_STATUS_LABELS[q.status] || { label: q.status, bg: '#f3f4f6', color: '#6b7280' }
          const canEdit = q.status === 'pending' || q.status === 'viewed'
          const canCancel = ['pending', 'viewed', 'responded'].includes(q.status)
          const canAccept = q.status === 'responded' && q.host_response

          return (
            <div key={q.id} style={{
              background: '#fff',
              border: q.status === 'accepted' ? '2px solid #86efac' : q.status === 'pending' ? '1.5px solid #a3e635' : '1.5px solid #e8e8e8',
              borderRadius: 14, padding: 20
            }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {q.spaces?.media_urls?.[0] && (
                  <img src={q.spaces.media_urls[0]} alt={q.spaces?.name}
                    style={{ width: 110, height: 85, objectFit: 'cover', borderRadius: 10, flexShrink: 0, cursor: 'pointer' }}
                    onClick={() => goToPage('listing')} />
                )}

                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{q.spaces?.name || 'Espaço'}</h3>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>📍 {q.spaces?.city}, {q.spaces?.state} · {hoursAgo(q.created_at)}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: status.bg, color: status.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Detalhes */}
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
                    {[
                      { label: 'Evento', value: q.event_type },
                      { label: 'Data', value: fmtDate(q.event_date) },
                      ...(fmtTime(q.event_time) ? [{ label: 'Horário', value: fmtTime(q.event_time) }] : []),
                      { label: 'Convidados', value: q.guests_count },
                      { label: 'Duração', value: `${q.duration_hours}h` },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {q.message && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#4b5563' }}>
                      <strong>Sua mensagem:</strong> {q.message}
                    </div>
                  )}

                  {/* SLA para pendentes */}
                  {(q.status === 'pending' || q.status === 'viewed') && (
                    <div style={{ marginTop: 10, padding: '8px 12px', background: '#f0fdf4', borderRadius: 8, fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>⚡</span>
                      <span>Anunciantes respondem em até <strong>24 horas</strong></span>
                    </div>
                  )}

                  {/* Resposta do host */}
                  {q.host_response && (
                    <div style={{ marginTop: 10, padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 4 }}>💬 Resposta do anunciante:</div>
                      <div style={{ fontSize: 13, color: '#1f2937', lineHeight: 1.6 }}>{q.host_response}</div>
                      {q.proposed_price && (
                        <div style={{ marginTop: 8, fontSize: 16, fontWeight: 800, color: '#166534' }}>
                          💰 Proposta: R$ {q.proposed_price.toLocaleString('pt-BR')}
                        </div>
                      )}
                      {/* Contatos do espaço após resposta */}
                      {(q.spaces?.whatsapp || q.spaces?.instagram) && (
                        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {q.spaces.whatsapp && (
                            <a href={`https://wa.me/55${q.spaces.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', background: '#dcfce7', borderRadius: 6, color: '#166534', textDecoration: 'none' }}>
                              💬 WhatsApp
                            </a>
                          )}
                          {q.spaces.instagram && (
                            <a href={`https://instagram.com/${q.spaces.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', background: '#fdf4ff', borderRadius: 6, color: '#6d28d9', textDecoration: 'none' }}>
                              📸 Instagram
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Aceito */}
                  {q.status === 'accepted' && (
                    <div style={{ marginTop: 12, padding: '14px 18px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #86efac', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 28 }}>🎉</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#14532d' }}>Evento agendado!</div>
                        <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>Entre em contato com o anunciante para finalizar os detalhes.</div>
                      </div>
                    </div>
                  )}

                  {/* Recusado pelo host */}
                  {q.status === 'rejected' && (
                    <div style={{ marginTop: 10, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#991b1b' }}>
                      ✕ O anunciante não tem disponibilidade para esta data. Tente outro espaço!
                    </div>
                  )}

                  {/* Ações */}
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {canAccept && (
                      <button onClick={() => acceptQuote(q)}
                        style={{ padding: '9px 18px', fontSize: 13, fontWeight: 700, background: '#a3e635', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#1a2e05', fontFamily: 'inherit' }}>
                        ✓ Aceitar orçamento
                      </button>
                    )}
                    {canEdit && (
                      <button onClick={() => openEdit(q)}
                        style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, background: '#eff6ff', border: '1.5px solid #bfdbfe', borderRadius: 8, cursor: 'pointer', color: '#1d4ed8', fontFamily: 'inherit' }}>
                        ✏️ Editar
                      </button>
                    )}
                    {canCancel && (
                      cancelConfirm === q.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, color: '#dc2626' }}>Confirmar?</span>
                          <button onClick={() => cancelQuote(q.id)} style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, background: '#fee2e2', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#dc2626', fontFamily: 'inherit' }}>Sim</button>
                          <button onClick={() => setCancelConfirm(null)} style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700, background: '#f3f4f6', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#6b7280', fontFamily: 'inherit' }}>Não</button>
                        </div>
                      ) : (
                        <button onClick={() => setCancelConfirm(q.id)}
                          style={{ padding: '9px 14px', fontSize: 12, fontWeight: 600, background: '#fff', border: '1.5px solid #fecaca', borderRadius: 8, cursor: 'pointer', color: '#991b1b', fontFamily: 'inherit' }}>
                          ✕ {q.status === 'responded' ? 'Recusar proposta' : 'Cancelar'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* MODAL EDIÇÃO */}
      {editingQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={e => e.target === e.currentTarget && setEditingQuote(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>✏️ Editar solicitação</h2>
              <button onClick={() => setEditingQuote(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: '#d97706', background: '#fffbeb', padding: '8px 12px', borderRadius: 8, marginBottom: 16 }}>
              ⚠️ Editar enviará a solicitação novamente como pendente
            </div>
            <div className="fg">
              <label>Tipo de evento</label>
              <select value={editForm.event_type} onChange={e => setEditForm(f => ({ ...f, event_type: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fg">
                <label>Data do evento</label>
                <input type="date" value={editForm.event_date} onChange={e => setEditForm(f => ({ ...f, event_date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="fg">
                <label>Horário</label>
                <input type="time" value={editForm.event_time} onChange={e => setEditForm(f => ({ ...f, event_time: e.target.value }))} />
              </div>
              <div className="fg">
                <label>Convidados</label>
                <input type="number" value={editForm.guests_count} onChange={e => setEditForm(f => ({ ...f, guests_count: e.target.value }))} min={1} />
              </div>
              <div className="fg">
                <label>Duração (horas)</label>
                <input type="number" value={editForm.duration_hours} onChange={e => setEditForm(f => ({ ...f, duration_hours: e.target.value }))} min={1} />
              </div>
            </div>
            <div className="fg">
              <label>Mensagem</label>
              <textarea value={editForm.message} onChange={e => setEditForm(f => ({ ...f, message: e.target.value }))} rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={saveEdit} className="btn-primary" style={{ flex: 1, padding: 12 }} disabled={editLoading}>
                {editLoading ? 'Salvando...' : 'Salvar alterações'}
              </button>
              <button onClick={() => setEditingQuote(null)} style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, background: '#f9fafb', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CELEBRAÇÃO */}
      {celebrationQuote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 24, padding: '44px 40px', width: '100%', maxWidth: 420, textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#14532d', marginBottom: 10 }}>Evento agendado!</h2>
            <p style={{ fontSize: 15, color: '#166534', lineHeight: 1.7, marginBottom: 8 }}>
              Você aceitou o orçamento de <strong>{celebrationQuote.spaces?.name}</strong>.
            </p>
            {celebrationQuote.proposed_price && (
              <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a', margin: '12px 0', padding: '12px', background: '#f0fdf4', borderRadius: 12 }}>
                R$ {celebrationQuote.proposed_price.toLocaleString('pt-BR')}
              </div>
            )}
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28, lineHeight: 1.6 }}>
              Entre em contato com o anunciante para finalizar os detalhes. Os links de contato estão disponíveis na resposta do orçamento. 🥂
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setCelebrationQuote(null); goToPage('listing') }}
                style={{ flex: 1, padding: 13, fontSize: 13, fontWeight: 600, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 10, cursor: 'pointer', color: '#14532d', fontFamily: 'inherit' }}>
                Ver mais espaços
              </button>
              <button onClick={() => setCelebrationQuote(null)} className="btn-primary" style={{ flex: 1, padding: 13, fontSize: 14 }}>
                Perfeito! ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
