import { t, type Lang } from '../translations'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Space } from '../types'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page, space?: Space) => void
  lang?: Lang
}

export default function HostDashboard({  user, goToPage, lang = 'pt' }: Props) {
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
    setSaveMsg('{t[lang].dash_saved}'); setSaving(false); setTimeout(() => setSaveMsg(''), 3000)
  }

  const TABS = [
    { key: 'espacos', icon: '🏢', label: t[lang].host_dash_spaces },
    { key: 'orcamentos', icon: '📋', label: t[lang].my_quotes_title },
    { key: 'dados', icon: '👤', label: t[lang].dash_my_data },
    { key: 'sac', icon: '🎧', label: t[lang].dash_support },
  ]

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Host'

  return (
      <span style={{
        fontSize: 11, fontWeight: 600, padding: '3px 10px',
        borderRadius: 100, background: c.bg, color: c.color
      }}>{c.label}</span>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#f4f6f8', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#111', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
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
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ width: '100%', textAlign: 'left', padding: '11px 18px', display: 'flex', alignItems: 'center', gap: 10, background: tab === t.key ? 'rgba(163,230,53,0.12)' : 'transparent', border: 'none', borderLeft: tab === t.key ? '3px solid #a3e635' : '3px solid transparent', color: tab === t.key ? '#a3e635' : '#9ca3af', fontSize: 13, fontWeight: tab === t.key ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
              <span>{t.icon}</span>{t.label}
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
            <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 2 }}>
              {tab === 'espacos' ? t[lang].host_dash_spaces : tab === 'orcamentos' ? 'Orçamentos recebidos' : tab === 'dados' ? t[lang].dash_my_data : 'Central de suporte'}
            </h1>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
              {tab === 'espacos' ? t[lang].host_dash_sub : tab === 'orcamentos' ? (lang === 'en' ? 'View and respond to quotes' : 'Veja e responda orçamentos') : tab === 'dados' ? (lang === 'en' ? 'Update your information' : 'Atualize suas informações') : t[lang].dash_sac_title}
            </p>
          </div>
          {tab === 'espacos' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => goToPage('host-quotes')} style={{ fontSize: 12, padding: '9px 14px', fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer', color: '#2d2d2d', fontFamily: 'inherit' }}>{t[lang].host_dash_quotes}</button>
              <button className="btn-primary" onClick={() => goToPage('new-space')}>{t[lang].host_dash_new}</button>
            </div>
          )}
          {tab === 'orcamentos' && (
            <button className="btn-primary" onClick={() => goToPage('new-space')}>{t[lang].host_dash_new}</button>
          )}
        </div>

        <div style={{ padding: '24px 28px' }}>

      {/* Tab: Dados */}
      {tab === 'dados' && (
        <div style={{ maxWidth: 480, background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="fg"><label>Nome completo</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
          <div className="fg"><label>Email</label><input type="email" value={user.email || ''} disabled style={{ background: '#f9fafb', color: '#9ca3af' }} /></div>
          <div className="fg"><label>WhatsApp</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(41) 99999-9999" /></div>
          {saveMsg && <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{saveMsg}</div>}
          <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      )}

      {/* Tab: SAC */}
      {tab === 'sac' && (
        <div style={{ maxWidth: 520, background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28 }}>
          {sacSent ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
              <p style={{ fontSize: 14, color: '#166534', fontWeight: 700 }}>Mensagem enviada! {lang === 'en' ? 'We will respond within 24h.' : 'Respondemos em até 24h.'}</p>
              <button onClick={() => { setSacSent(false); setSacSubject(''); setSacMsg('') }} style={{ marginTop: 12, fontSize: 12, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{t[lang].dash_sac_another}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="fg">
                <label>Assunto</label>
                <select value={sacSubject} onChange={e => setSacSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                  <option value="">Selecione...</option>
                  <option>Dúvida sobre planos</option><option>Problema com orçamento</option><option>Erro no cadastro</option><option>Outro</option>
                </select>
              </div>
              <div className="fg"><label>Mensagem</label><textarea value={sacMsg} onChange={e => setSacMsg(e.target.value)} rows={4} placeholder="Descreva..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} /></div>
              <button onClick={() => setSacSent(true)} disabled={!sacSubject || !sacMsg.trim()} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '9px 22px' }}>{t[lang].dash_sac_send}</button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Orçamentos — redirect */}
      {tab === 'orcamentos' && (
        <div style={{ textAlign: 'center', padding: '40px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{t[lang].host_quotes_title}</h3>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Visualize e responda todos os orçamentos dos seus espaços.</p>
          <button className="btn-primary" onClick={() => goToPage('host-quotes')} style={{ padding: '12px 28px', fontSize: 15 }}>
            Ver todos os orçamentos →
          </button>
        </div>
      )}

      {/* Tab: Espaços */}
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

      {loading && <p>{t[lang].loading}</p>}

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
                  {s.status === 'active' ? '{t[lang].host_dash_pause}' : '{t[lang].host_dash_activate}'}
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
        </div>
      </div>
    </div>
  )
}
