import { useCopy } from '../i18n'
import { AUTH } from '../i18n/auth'
import { useState } from 'react'
import { supabase } from '../supabase'
import { BASE_PATH, IS_DEMO } from '../demo/config'
import DemoAuthNotice from '../demo/DemoAuthNotice'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

type Mode = 'login' | 'forgot' | 'forgot-sent'

export default function LoginPage({ goToPage }: Props) {
  const a = useCopy(AUTH)
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      goToPage('home')
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials'
        ? a.wrongCreds
        : (err.message || a.loginErr))
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + BASE_PATH
      })
      if (error) throw error
      setMode('forgot-sent')
    } catch (err: any) {
      setError(err.message || a.sendErr)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">

        {/* Logo */}
        <div onClick={() => goToPage('home')} style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 24 }}>
          <img src="/logo.png" alt="Ewind" className="logo-img" />
        </div>

        {/* ===== LOGIN ===== */}
        {mode === 'login' && (
          <>
            <h1 className="auth-title">{a.login}</h1>
            <p className="auth-sub">{a.welcome}</p>
            {IS_DEMO && <DemoAuthNotice goToPage={goToPage} compact />}

            <form onSubmit={handleLogin}>
              <div className="fg">
                <label>{a.email}</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={a.emailPh}
                />
              </div>
              <div className="fg">
                <label>{a.password}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={a.passwordPh}
                />
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: 13, marginTop: 8 }}
                disabled={loading}
              >
                {loading ? a.loggingIn : a.login}
              </button>
            </form>

            {/* Links fluidos */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!IS_DEMO && <button
                onClick={() => { setMode('forgot'); setError('') }}
                style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}
              >
                {a.forgot}
              </button>}

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => goToPage('signup')}
                  style={{
                    flex: 1, padding: '10px 12px', fontSize: 13, fontWeight: 600,
                    background: '#f9fafb', border: '1.5px solid #e8e8e8',
                    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#2d2d2d'
                  }}
                >
                  {a.createAccount}
                </button>
                <button
                  onClick={() => goToPage('signup')}
                  style={{
                    flex: 1, padding: '10px 12px', fontSize: 13, fontWeight: 600,
                    background: '#f0fdf4', border: '1.5px solid #a3e635',
                    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#1a2e05'
                  }}
                >
                  {a.imSupplier}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== ESQUECI SENHA ===== */}
        {mode === 'forgot' && (
          <>
            <h1 className="auth-title">{a.resetTitle}</h1>
            <p className="auth-sub">
              {a.resetSub}
            </p>

            <form onSubmit={handleForgot}>
              <div className="fg">
                <label>{a.regEmail}</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={a.emailPh}
                />
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: 13, marginTop: 8 }}
                disabled={loading}
              >
                {loading ? a.sending : a.sendLink}
              </button>
            </form>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={() => { setMode('login'); setError('') }}
                style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {a.backLogin}
              </button>
            </div>
          </>
        )}

        {/* ===== EMAIL ENVIADO ===== */}
        {mode === 'forgot-sent' && (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{a.sentTitle}</h1>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 8 }}>
                {a.sentTo} <strong>{email}</strong>.
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
                {a.sentHint}
              </p>
            </div>

            <button
              onClick={() => { setMode('login'); setError(''); setEmail('') }}
              className="btn-primary"
              style={{ width: '100%', padding: 13 }}
            >
              {a.backLoginPlain}
            </button>

            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              {a.notReceived}{' '}
              <button
                onClick={() => setMode('forgot')}
                style={{ background: 'none', border: 'none', color: '#5aa800', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
              >
                {a.resend}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
