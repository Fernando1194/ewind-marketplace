import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'
import type { Page } from '../App'

interface Props {
  user: User
  goToPage: (page: Page) => void
}

type Tab = 'orcamentos' | 'dados' | 'sac'

const SC: Record<string, string> = {
  pending: '#d97706', viewed: '#7c3aed', responded: '#2563eb',
  accepted: '#16a34a', closed: '#6b7280', rejected: '#dc2626'
}
const SL: Record<string, string> = {
  pending: 'Aguardando', viewed: 'Visto', responded: 'Respondido',
  accepted: 'Aceito', closed: 'Fechado', rejected: 'Recusado'
}

export default function GuestDashboard({ user, goToPage }: Props) {
  const [tab, setTab] = useState<Tab>('orcamentos')
  const [quotes, setQuotes] = useState<any[]>([])
  const [loadingQ, setLoadingQ] = useState(true)
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [sacSubject, setSacSubject] = useState('')
  const [sacMsg, setSacMsg] = useState('')
  const [sacSent, setSacSent] = useState(false)

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Visitante'
  const initial = name.charAt(0).toUpperCase()

  useEffect(() => {
    supabase.from('quotes')
      .select('*, spaces(id,name,city,state,category), suppliers(id,name,category)')
      .eq('guest_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setQuotes(data || []); setLoadingQ(false) })
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id)
    setSaveMsg('✓ Dados salvos!'); setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const TABS: { key: Tab; icon: string; label: string }[] = [
    { key: 'orcamentos', icon: '📋', label: 'Meus orçamentos' },
    { key: 'dados', icon: '👤', label: 'Meus dados' },
    { key: 'sac', icon: '🎧', label: 'Suporte' },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#f4f6f8', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#111', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#a3e635', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#1a2e05', flexShrink: 0 }}>
              {initial}
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
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #e8e8e8', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 800, marginBottom: 2 }}>
              {tab === 'orcamentos' ? 'Meus orçamentos' : tab === 'dados' ? 'Meus dados' : 'Central de suporte'}
            </h1>
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
              {tab === 'orcamentos' ? 'Acompanhe os orçamentos que você solicitou' : tab === 'dados' ? 'Atualize suas informações' : 'Nossa equipe responde em até 24h'}
            </p>
          </div>
          {tab === 'orcamentos' && (
            <button className="btn-primary" onClick={() => goToPage('listing')} style={{ fontSize: 13, padding: '9px 18px' }}>+ Buscar espaços</button>
          )}
        </div>

        <div style={{ padding: '24px 28px' }}>

          {/* Orçamentos */}
          {tab === 'orcamentos' && (
            <div>
              {loadingQ && <p style={{ color: '#9ca3af' }}>Carregando...</p>}
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
                          🎉 {q.event_type}
                          {q.event_date && ` · ${new Date(q.event_date + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                          {q.guests_count && ` · ${q.guests_count} convidados`}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {new Date(q.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {q.proposed_price && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>Valor proposto</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#5aa800' }}>R$ {Number(q.proposed_price).toLocaleString('pt-BR')}</div>
                          </div>
                        )}
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: `${SC[q.status] || '#9ca3af'}18`, color: SC[q.status] || '#9ca3af' }}>
                          {SL[q.status] || q.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dados */}
          {tab === 'dados' && (
            <div style={{ maxWidth: 480, background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="fg"><label>Nome completo</label><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
              <div className="fg"><label>Email</label><input type="email" value={user.email || ''} disabled style={{ background: '#f9fafb', color: '#9ca3af' }} /><p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>O email não pode ser alterado.</p></div>
              <div className="fg"><label>WhatsApp</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(41) 99999-9999" /></div>
              {saveMsg && <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>{saveMsg}</div>}
              <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
            </div>
          )}

          {/* SAC */}
          {tab === 'sac' && (
            <div style={{ maxWidth: 540 }}>
              {sacSent ? (
                <div style={{ background: '#f0fdf4', border: '1px solid #a3e635', borderRadius: 14, padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#166534', marginBottom: 8 }}>Mensagem enviada!</h3>
                  <p style={{ fontSize: 14, color: '#6b7280' }}>Responderemos em <strong>{user.email}</strong> em até 24h úteis.</p>
                  <button onClick={() => { setSacSent(false); setSacSubject(''); setSacMsg('') }} style={{ marginTop: 20, fontSize: 13, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Enviar outra mensagem</button>
                </div>
              ) : (
                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e8e8', padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="fg">
                    <label>Assunto</label>
                    <select value={sacSubject} onChange={e => setSacSubject(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: '#fff' }}>
                      <option value="">Selecione...</option>
                      <option>Problema com orçamento</option>
                      <option>Anunciante não respondeu</option>
                      <option>Erro no cadastro</option>
                      <option>Dúvida sobre planos</option>
                      <option>Denúncia de anúncio</option>
                      <option>Outro</option>
                    </select>
                  </div>
                  <div className="fg"><label>Mensagem</label><textarea value={sacMsg} onChange={e => setSacMsg(e.target.value)} rows={5} placeholder="Descreva detalhadamente..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical' }} /></div>
                  <button onClick={() => setSacSent(true)} disabled={!sacSubject || !sacMsg.trim()} className="btn-primary" style={{ alignSelf: 'flex-start', padding: '10px 24px' }}>📨 Enviar mensagem</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
