import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
  onAccept: (categories: CookieCategories) => void
}

export interface CookieCategories {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

const STORAGE_KEY = 'ewind_cookie_consent'

export function getCookieConsent(): { decided: boolean; categories: CookieCategories } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { decided: false, categories: { essential: true, analytics: false, marketing: false } }
    return JSON.parse(raw)
  } catch {
    return { decided: false, categories: { essential: true, analytics: false, marketing: false } }
  }
}

export default function CookieBanner({ user, onAccept }: Props) {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    const consent = getCookieConsent()
    if (!consent.decided) setVisible(true)
  }, [])

  const logConsent = async (action: string, categories: CookieCategories) => {
    try {
      await supabase.from('consent_logs').insert({
        user_id: user?.id || null,
        session_id: sessionStorage.getItem('ewind_session') || crypto.randomUUID(),
        action,
        categories,
        user_agent: navigator.userAgent.slice(0, 200),
      })
      if (user?.id) {
        await supabase.from('profiles').update({
          lgpd_consent: true,
          lgpd_consent_at: new Date().toISOString(),
          analytics_consent: categories.analytics,
          marketing_consent: categories.marketing,
        }).eq('id', user.id)
      }
    } catch (e) {
      console.error('Consent log error:', e)
    }
  }

  const save = (action: string, cats: CookieCategories) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ decided: true, categories: cats, decidedAt: new Date().toISOString() }))
    logConsent(action, cats)
    onAccept(cats)
    setVisible(false)
  }

  const acceptAll = () => save('accept_all', { essential: true, analytics: true, marketing: true })
  const acceptEssential = () => save('accept_essential', { essential: true, analytics: false, marketing: false })
  const saveCustom = () => save('accept_all', { essential: true, analytics, marketing })

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#111', color: '#fff', boxShadow: '0 -4px 24px rgba(0,0,0,0.3)',
      borderTop: '3px solid #a3e635'
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px' }}>

        {!showDetails ? (
          /* Compact view */
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🍪</span>
                <strong style={{ fontSize: 15 }}>Usamos cookies</strong>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
                Utilizamos cookies essenciais para o funcionamento do site e, com seu consentimento, cookies analíticos para melhorar sua experiência.
                Em conformidade com a <strong style={{ color: '#a3e635' }}>LGPD (Lei 13.709/2018)</strong>.{' '}
                <a href="/termos" style={{ color: '#a3e635', textDecoration: 'underline', cursor: 'pointer' }}>Política de Privacidade</a>
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              <button onClick={() => setShowDetails(true)}
                style={{ padding: '9px 16px', fontSize: 12, fontWeight: 600, background: 'transparent', border: '1px solid #4b5563', color: '#9ca3af', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                ⚙️ Personalizar
              </button>
              <button onClick={acceptEssential}
                style={{ padding: '9px 16px', fontSize: 12, fontWeight: 600, background: 'transparent', border: '1px solid #6b7280', color: '#d1d5db', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                Somente essenciais
              </button>
              <button onClick={acceptAll}
                style={{ padding: '9px 20px', fontSize: 12, fontWeight: 700, background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                Aceitar todos
              </button>
            </div>
          </div>
        ) : (
          /* Detailed view */
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <strong style={{ fontSize: 15 }}>⚙️ Preferências de cookies</strong>
              <button onClick={() => setShowDetails(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {[
              {
                key: 'essential', label: 'Essenciais', required: true,
                desc: 'Necessários para autenticação, segurança e funcionamento básico do site. Não podem ser desativados.',
                enabled: true, icon: '🔒'
              },
              {
                key: 'analytics', label: 'Analíticos', required: false,
                desc: 'Nos ajudam a entender como você usa o site para melhorar a experiência. Dados anonimizados.',
                enabled: analytics, icon: '📊'
              },
              {
                key: 'marketing', label: 'Marketing', required: false,
                desc: 'Permitem personalização de conteúdo e comunicações relevantes. Você pode optar por não receber.',
                enabled: marketing, icon: '📣'
              },
            ].map(cat => (
              <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #1f2937' }}>
                <div style={{ flex: 1, marginRight: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{cat.icon} {cat.label}{cat.required && <span style={{ marginLeft: 6, fontSize: 10, background: '#1f2937', padding: '2px 6px', borderRadius: 4, color: '#6b7280' }}>Obrigatório</span>}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{cat.desc}</div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {cat.required ? (
                    <div style={{ width: 44, height: 24, background: '#a3e635', borderRadius: 12, position: 'relative' }}>
                      <div style={{ position: 'absolute', right: 3, top: 3, width: 18, height: 18, background: '#fff', borderRadius: '50%' }} />
                    </div>
                  ) : (
                    <button onClick={() => cat.key === 'analytics' ? setAnalytics(!analytics) : setMarketing(!marketing)}
                      style={{ width: 44, height: 24, background: cat.enabled ? '#a3e635' : '#374151', border: 'none', borderRadius: 12, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                      <div style={{ position: 'absolute', top: 3, left: cat.enabled ? 'auto' : 3, right: cat.enabled ? 3 : 'auto', width: 18, height: 18, background: '#fff', borderRadius: '50%', transition: 'all 0.2s' }} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={acceptEssential}
                style={{ padding: '9px 16px', fontSize: 12, fontWeight: 600, background: 'transparent', border: '1px solid #4b5563', color: '#9ca3af', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                Somente essenciais
              </button>
              <button onClick={saveCustom}
                style={{ padding: '9px 16px', fontSize: 12, fontWeight: 600, background: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                Salvar preferências
              </button>
              <button onClick={acceptAll}
                style={{ padding: '9px 20px', fontSize: 12, fontWeight: 700, background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                Aceitar todos
              </button>
            </div>

            <p style={{ fontSize: 10, color: '#4b5563', marginTop: 12, textAlign: 'center' }}>
              Conforme LGPD (Lei 13.709/2018) · Você pode alterar suas preferências a qualquer momento no seu painel · <a href="/termos" style={{ color: '#6b7280', textDecoration: 'underline' }}>Política de Privacidade</a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
