import { useState } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

type Mode = 'login' | 'forgot' | 'forgot-sent'

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
) : (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

export default function LoginPage({ goToPage }: Props) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

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
        ? 'Email ou senha incorretos'
        : (err.message || 'Erro ao entrar'))
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
        redirectTo: window.location.origin
      })
      if (error) throw error
      setMode('forgot-sent')
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email')
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
            <h1 className="auth-title">Entrar</h1>
            <p className="auth-sub">Bem-vindo de volta!</p>

            <form onSubmit={handleLogin}>
              <div className="fg">
                <label>Email</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <div className="fg">
                <label>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    style={{ paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: 13, marginTop: 8 }}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Links fluidos */}
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => { setMode('forgot'); setError('') }}
                style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}
              >
                Esqueci minha senha
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => goToPage('signup')}
                  style={{
                    flex: 1, padding: '10px 12px', fontSize: 13, fontWeight: 600,
                    background: '#f9fafb', border: '1.5px solid #e8e8e8',
                    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#2d2d2d'
                  }}
                >
                  Criar conta
                </button>
                <button
                  onClick={() => goToPage('supplier-login')}
                  style={{
                    flex: 1, padding: '10px 12px', fontSize: 13, fontWeight: 600,
                    background: '#f0fdf4', border: '1.5px solid #a3e635',
                    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#1a2e05'
                  }}
                >
                  🛠️ Sou fornecedor
                </button>
              </div>
            </div>
          </>
        )}

        {/* ===== ESQUECI SENHA ===== */}
        {mode === 'forgot' && (
          <>
            <h1 className="auth-title">Redefinir senha</h1>
            <p className="auth-sub">
              Digite seu email e enviaremos um link para criar uma nova senha.
            </p>

            <form onSubmit={handleForgot}>
              <div className="fg">
                <label>Email cadastrado</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              {error && <div className="auth-error">⚠️ {error}</div>}

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: 13, marginTop: 8 }}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={() => { setMode('login'); setError('') }}
                style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                ← Voltar ao login
              </button>
            </div>
          </>
        )}

        {/* ===== EMAIL ENVIADO ===== */}
        {mode === 'forgot-sent' && (
          <>
            <div style={{ textAlign: 'center', padding: '8px 0 24px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Email enviado!</h1>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 8 }}>
                Enviamos um link para <strong>{email}</strong>.
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6 }}>
                Verifique sua caixa de entrada e a pasta de spam. O link expira em 1 hora.
              </p>
            </div>

            <button
              onClick={() => { setMode('login'); setError(''); setEmail('') }}
              className="btn-primary"
              style={{ width: '100%', padding: 13 }}
            >
              Voltar ao login
            </button>

            <div style={{ marginTop: 12, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
              Não recebeu?{' '}
              <button
                onClick={() => setMode('forgot')}
                style={{ background: 'none', border: 'none', color: '#5aa800', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
              >
                Reenviar
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
