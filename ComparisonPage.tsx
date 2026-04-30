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
        <div className="auth-switch">
          Não tem conta? <a onClick={() => goToPage('signup')}>Cadastre-se</a>
        </div>
      </div>
    </div>
  )
}
