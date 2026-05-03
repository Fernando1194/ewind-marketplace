import { useState } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

type Mode = 'login' | 'forgot' | 'forgot-sent'

export default function SupplierLoginPage({ goToPage }: Props) {
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
      goToPage('supplier-dashboard')
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
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f9fafb', display: 'flex' }}>

      {/* Lado esquerdo — visual */}
      <div style={{
        width: '42%',
        background: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 100%)',
        padding: '60px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }} className="supplier-side">
        <div
          onClick={() => goToPage('home')}
          style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 28 }}
        >
          <img src="/logo.png" alt="Ewind" className="logo-img" />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#a3e635', lineHeight: 1.25, marginBottom: 16 }}>
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
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
            Ainda não tem conta?
          </p>
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
      <div style={{
        flex: 1,
        padding: '48px 56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: 420 }}>

          {/* ===== LOGIN ===== */}
          {mode === 'login' && (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
                Entrar na área do fornecedor
              </h1>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
                Acesse seu painel de serviços.
              </p>

              <form onSubmit={handleLogin}>
                <div className="fg">
                  <label>Email</label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contato@email.com"
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
                      {showPass ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <div className="auth-error">⚠️ {error}</div>}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: 14, marginTop: 8, fontSize: 15 }}
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : '🛠️ Entrar no painel'}
                </button>
              </form>

              {/* Links fluidos */}
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => { setMode('forgot'); setError('') }}
                  style={{ background: 'none', border: 'none', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  Esqueci minha senha
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => goToPage('supplier-signup')}
                    style={{
                      flex: 1, padding: '10px 12px', fontSize: 13, fontWeight: 600,
                      background: '#f0fdf4', border: '1.5px solid #a3e635',
                      borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#1a2e05'
                    }}
                  >
                    Criar conta →
                  </button>
                  <button
                    onClick={() => goToPage('login')}
                    style={{
                      flex: 1, padding: '10px 12px', fontSize: 13, fontWeight: 600,
                      background: '#f9fafb', border: '1.5px solid #e8e8e8',
                      borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280'
                    }}
                  >
                    Login geral
                  </button>
                </div>

                <button
                  onClick={() => goToPage('home')}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
                >
                  ← Voltar para a home
                </button>
              </div>
            </>
          )}

          {/* ===== ESQUECI SENHA ===== */}
          {mode === 'forgot' && (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
                Redefinir senha
              </h1>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
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
                    placeholder="contato@email.com"
                  />
                </div>

                {error && <div className="auth-error">⚠️ {error}</div>}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: 14, marginTop: 8, fontSize: 15 }}
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>

              <div style={{ marginTop: 16 }}>
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
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>✉️</div>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Email enviado!</h1>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 6 }}>
                Enviamos um link para <strong>{email}</strong>.
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 28 }}>
                Verifique sua caixa de entrada e spam. O link expira em 1 hora.
              </p>

              <button
                onClick={() => { setMode('login'); setError(''); setEmail('') }}
                className="btn-primary"
                style={{ width: '100%', padding: 13 }}
              >
                Voltar ao login
              </button>

              <div style={{ marginTop: 12, fontSize: 13, color: '#9ca3af' }}>
                Não recebeu?{' '}
                <button
                  onClick={() => setMode('forgot')}
                  style={{ background: 'none', border: 'none', color: '#5aa800', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
                >
                  Reenviar
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
