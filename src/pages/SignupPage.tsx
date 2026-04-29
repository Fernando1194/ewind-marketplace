import { useState } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

export default function SignupPage({ goToPage }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'guest' | 'host'>('guest')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, role }
        }
      })

      if (error) throw error

      if (data.user) {
        setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.')
        setEmail('')
        setPassword('')
        setName('')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="logo-box" style={{ display: 'inline-block', marginBottom: 20 }}>EWIND</div>
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-sub">Cadastre-se gratuitamente</p>
        <form onSubmit={handleSignUp}>
          <div className="fg">
            <label>Você é...</label>
            <div className="role-toggle">
              <button type="button" className={`role-btn ${role === 'guest' ? 'on' : ''}`} onClick={() => setRole('guest')}>
                🎉 Buscando espaço
              </button>
              <button type="button" className={`role-btn ${role === 'host' ? 'on' : ''}`} onClick={() => setRole('host')}>
                🏢 Tenho um espaço
              </button>
            </div>
          </div>
          <div className="fg">
            <label>Nome completo</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="fg">
            <label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div className="fg">
            <label>Senha</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} />
          </div>
          {error && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✅ {success}</div>}
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 13, marginTop: 10 }} disabled={loading}>
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>
        <div className="auth-switch">
          Já tem conta? <a onClick={() => goToPage('login')}>Entrar</a>
        </div>
      </div>
    </div>
  )
}
