import { useState } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

export default function SupplierLoginPage({ goToPage }: Props) {
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
      goToPage('supplier-dashboard')
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos'
        : (err.message || 'Erro ao entrar'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f9fafb', display: 'flex' }}>

      {/* Lado esquerdo — visual */}
      <div style={{
        width: '42%', background: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
      }} className="supplier-side">
        <div className="logo-box" style={{ display: 'inline-block', marginBottom: 28 }}>EWIND</div>
        <h2 style={{ fontSize: 30, fontWeight: 800, color: '#a3e635', lineHeight: 1.2, marginBottom: 16 }}>
          Bem-vindo de volta, profissional!
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36 }}>
          Acesse seu painel, gerencie seus serviços e veja os clientes que entraram em contato.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '📊', text: 'Painel com seus serviços ativos' },
            { icon: '✏️', text: 'Editar e atualizar portfólio' },
            { icon: '⏸', text: 'Pausar quando precisar' },
            { icon: '🆓', text: 'Sempre gratuito' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 20 }}>{item.icon}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{item.text}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Ainda não tem conta?</div>
          <button
            onClick={() => goToPage('supplier-signup')}
            style={{
              padding: '10px 20px', fontSize: 14, fontWeight: 600,
              background: 'transparent', border: '1.5px solid rgba(163,230,53,0.5)',
              borderRadius: 8, color: '#a3e635', cursor: 'pointer', fontFamily: 'inherit'
            }}
          >
            Criar conta gratuita →
          </button>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={{ flex: 1, padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: 400 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Entrar na área do fornecedor</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
            Acesse seu painel de serviços.
          </p>

          <form onSubmit={handleLogin}>
            <div className="fg">
              <label>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contato@email.com"
                autoFocus
              />
            </div>
            <div className="fg">
              <label>Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: 14, marginTop: 10, fontSize: 15 }}
              disabled={loading}
            >
              {loading ? 'Entrando...' : '🛠️ Entrar no painel'}
            </button>
          </form>

          {!showForgot ? (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <a onClick={() => setShowForgot(true)} style={{ fontSize: 13, color: '#9ca3af', cursor: 'pointer' }}>
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
                  <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="contato@email.com" />
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
                  <button type="button" onClick={() => { setShowForgot(false); setForgotMsg('') }} style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 8, cursor: 'pointer' }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            Não tem conta ainda?{' '}
            <a onClick={() => goToPage('supplier-signup')} style={{ color: '#5aa800', fontWeight: 600, cursor: 'pointer' }}>
              Cadastrar gratuitamente →
            </a>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            <a onClick={() => goToPage('login')} style={{ color: '#9ca3af', cursor: 'pointer' }}>
              Login como host ou guest →
            </a>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            <a onClick={() => goToPage('home')} style={{ color: '#9ca3af', cursor: 'pointer' }}>
              ← Voltar para a home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
