import { useState } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

type Role = 'guest' | 'host' | 'supplier'

const ROLES: { value: Role; icon: string; label: string; desc: string }[] = [
  {
    value: 'guest',
    icon: '🎉',
    label: 'Busco um espaço',
    desc: 'Quero encontrar e contratar espaços para meus eventos'
  },
  {
    value: 'host',
    icon: '🏢',
    label: 'Tenho um espaço',
    desc: 'Quero anunciar meu espaço e receber orçamentos'
  },
  {
    value: 'supplier',
    icon: '🛠️',
    label: 'Sou fornecedor',
    desc: 'Ofereço serviços para eventos: foto, buffet, DJ, decoração e mais'
  }
]

export default function SignupPage({ goToPage }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('guest')
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
        options: { data: { full_name: name, role } }
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
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="logo-box" style={{ display: 'inline-block', marginBottom: 20 }}>EWIND</div>
        <h1 className="auth-title">Criar conta</h1>
        <p className="auth-sub">Cadastre-se gratuitamente</p>

        <form onSubmit={handleSignUp}>
          {/* Seleção de papel */}
          <div className="fg">
            <label>Você é...</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: '12px 16px',
                    border: role === r.value ? '2px solid #a3e635' : '1.5px solid #e8e8e8',
                    borderRadius: 10,
                    background: role === r.value ? '#f0fdf4' : '#fff',
                    color: role === r.value ? '#1a2e05' : '#2d2d2d',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: role === r.value ? '#365314' : '#6b7280', fontWeight: 400 }}>
                      {r.desc}
                    </div>
                  </div>
                  {role === r.value && (
                    <span style={{ marginLeft: 'auto', color: '#5aa800', fontSize: 18 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="fg">
            <label>Nome completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div className="fg">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <div className="fg">
            <label>Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}
          {success && <div className="auth-success">✅ {success}</div>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: 13, marginTop: 10 }}
            disabled={loading}
          >
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
