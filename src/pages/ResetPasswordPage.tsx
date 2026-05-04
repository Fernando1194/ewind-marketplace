import { useState, useMemo } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

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

export default function ResetPasswordPage({ goToPage }: Props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [touched, setTouched] = useState(false)

  const rules = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }), [password])

  const allRulesOk = rules.length && rules.upper && rules.special

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTouched(true)

    if (!allRulesOk) { setError('A senha não atende todos os requisitos'); return }
    if (password !== confirm) { setError('As senhas não coincidem'); return }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-wrap">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔐</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>Senha redefinida!</h1>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
            Sua senha foi alterada com sucesso. Agora você pode entrar com a nova senha.
          </p>
          <button
            className="btn-primary"
            style={{ width: '100%', padding: 13, fontSize: 15 }}
            onClick={() => goToPage('login')}
          >
            Entrar na minha conta →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <img
          src="/logo.png"
          alt="Ewind"
          className="logo-img-md"
          onClick={() => goToPage('home')}
          style={{ cursor: 'pointer' }}
        />
        <h1 className="auth-title">Criar nova senha</h1>
        <p className="auth-sub">
          Escolha uma senha segura para proteger sua conta.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nova senha */}
          <div className="fg">
            <label>Nova senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Crie uma senha segura"
                style={{ paddingRight: 44 }}
                autoFocus
              />
              <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                <EyeIcon open={showPass} />
              </button>
            </div>

            {/* Regras de senha */}
            {(touched || password.length > 0) && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { ok: rules.length, label: 'Mínimo de 8 caracteres' },
                  { ok: rules.upper, label: 'Pelo menos uma letra maiúscula' },
                  { ok: rules.special, label: 'Pelo menos um caractere especial (!@#$%...)' },
                ].map((rule, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: rule.ok ? '#16a34a' : '#6b7280', fontWeight: rule.ok ? 600 : 400 }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: rule.ok ? '#dcfce7' : '#f3f4f6',
                      border: `1.5px solid ${rule.ok ? '#16a34a' : '#d1d5db'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 10
                    }}>
                      {rule.ok ? '✓' : ''}
                    </span>
                    {rule.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="fg">
            <label>Confirmar nova senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Digite a senha novamente"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {confirm.length > 0 && password !== confirm && (
              <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>
                ⚠️ As senhas não coincidem
              </div>
            )}
            {confirm.length > 0 && password === confirm && allRulesOk && (
              <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
                ✓ Senhas coincidem
              </div>
            )}
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: 13, marginTop: 8, fontSize: 15 }}
            disabled={loading}
          >
            {loading ? 'Salvando...' : '🔐 Salvar nova senha'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
          <a onClick={() => goToPage('login')} style={{ color: '#9ca3af', cursor: 'pointer' }}>
            ← Voltar ao login
          </a>
        </div>
      </div>
    </div>
  )
}
