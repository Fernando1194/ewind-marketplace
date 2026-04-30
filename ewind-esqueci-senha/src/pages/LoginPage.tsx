import { useState } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

export default function LoginPage({ goToPage }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMsg, setForgotMsg] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotMsg('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin
      })
      if (error) throw error
      setForgotMsg('Email enviado! Verifique sua caixa de entrada.')
    } catch (err: any) {
      setForgotMsg('Erro: ' + (err.message || 'tente novamente'))
    } finally {
      setForgotLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      goToPage('home')
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou senha incorretos' : (err.message || 'Erro ao entrar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="logo-box" style={{ display: 'inline-block', marginBottom: 20 }}>EWIND</div>
        <h1 className="auth-title">Entrar</h1>
        <p className="auth-sub">Bem-vindo de volta!</p>
        <form onSubmit={handleLogin}>
          <div className="fg">
            <label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div className="fg">
            <label>Senha</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha" />
          </div>
          {error && <div className="auth-error">⚠️ {error}</div>}
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 13, marginTop: 10 }} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        {!showForgot ? (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <a
              onClick={() => setShowForgot(true)}
              style={{ fontSize: 13, color: '#6b7280', cursor: 'pointer' }}
            >
              Esqueci minha senha
            </a>
          </div>
        ) : (
          <div style={{ marginTop: 16, padding: 16, background: '#f9fafb', borderRadius: 10, border: '1px solid #e8e8e8' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Redefinir senha</div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
              Digite seu email e enviaremos um link para redefinir sua senha.
            </p>
            <form onSubmit={handleForgot}>
              <div className="fg">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              {forgotMsg && (
                <div className={forgotMsg.startsWith('Email') ? 'auth-success' : 'auth-error'}>
                  {forgotMsg.startsWith('Email') ? '✅' : '⚠️'} {forgotMsg}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={forgotLoading}>
                  {forgotLoading ? 'Enviando...' : 'Enviar link'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setForgotMsg('') }}
                  style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="auth-switch">
          Não tem conta? <a onClick={() => goToPage('signup')}>Cadastre-se</a>
        </div>
        <div className="auth-switch" style={{ marginTop: 8 }}>
          É fornecedor de serviços? <a onClick={() => goToPage('supplier-signup')} style={{ color: '#5aa800', fontWeight: 600 }}>Cadastre-se aqui →</a>
        </div>
        <div className="auth-switch" style={{ marginTop: 8 }}>
          Já tem conta de fornecedor? <a onClick={() => goToPage('supplier-login')} style={{ color: '#5aa800', fontWeight: 600 }}>Entrar →</a>
        </div>
      </div>
    </div>
  )
}
