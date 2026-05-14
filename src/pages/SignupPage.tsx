import { useState, useMemo } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

type Role = 'guest' | 'host' | 'supplier'

const ROLES: { value: Role; icon: string; label: string; desc: string }[] = [
  { value: 'guest', icon: 'ð', label: 'Preciso de um espaÃ§o', desc: 'Quero encontrar, comparar e solicitar orÃ§amentos para o meu evento' },
  { value: 'host', icon: 'ð¢', label: 'Tenho um espaÃ§o para locar', desc: 'Quero anunciar meu espaÃ§o e receber solicitaÃ§Ãµes de orÃ§amento qualificadas' },
  { value: 'supplier', icon: 'ð ï¸', label: 'OfereÃ§o serviÃ§os para eventos', desc: 'Sou fotÃ³grafo, DJ, buffet, decorador, cerimonialista ou outro fornecedor' },
]

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

export default function SignupPage({ goToPage }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('guest')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touchedPass, setTouchedPass] = useState(false)
  const [touchedConfirm, setTouchedConfirm] = useState(false)

  const rules = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  }), [password])

  const allRulesOk = rules.length && rules.upper && rules.special

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setTouchedPass(true)
    setTouchedConfirm(true)
    if (!allRulesOk) { setError('A senha nÃ£o atende todos os requisitos'); return }
    if (password !== confirmPassword) { setError('As senhas nÃ£o coincidem'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, role } }
      })
      if (error) throw error
      if (data.user) {
        // Criar perfil com role correto imediatamente
        const finalRole = extraRoles.includes('host') ? 'host' : extraRoles.includes('supplier') ? 'supplier' : role
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          email,
          role: finalRole,
          is_host: extraRoles.includes('host') || role === 'host',
          is_supplier: extraRoles.includes('supplier') || role === 'supplier',
          updated_at: new Date().toISOString()
        })
        setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.')
        setEmail(''); setPassword(''); setConfirmPassword(''); setName('')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <img src="/logo.png" alt="Ewind" className="logo-img-md" onClick={() => goToPage('home')} style={{ cursor: 'pointer' }} />
        <h1 className="auth-title">Criar conta gratuita</h1>
        <p className="auth-sub">FaÃ§a parte do marketplace de eventos do Brasil</p>

        <form onSubmit={handleSignUp}>
          <div className="fg">
            <label>Como vocÃª vai usar o Ewind?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ROLES.map(r => (
                <button key={r.value} type="button" onClick={() => setRole(r.value)}
                  style={{ padding: '12px 16px', border: role === r.value ? '2px solid #a3e635' : '1.5px solid #e8e8e8', borderRadius: 10, background: role === r.value ? '#f0fdf4' : '#fff', color: role === r.value ? '#1a2e05' : '#2d2d2d', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: role === r.value ? '#365314' : '#6b7280' }}>{r.desc}</div>
                  </div>
                  {role === r.value && <span style={{ marginLeft: 'auto', color: '#5aa800', fontSize: 18 }}>â</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="fg">
            <label>Nome completo</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Como vocÃª quer ser chamado" />
          </div>

          <div className="fg">
            <label>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>

          <div className="fg">
            <label>Senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouchedPass(true)}
                placeholder="Crie uma senha segura"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                <EyeIcon open={showPass} />
              </button>
            </div>

            {/* Regras de senha */}
            {(touchedPass || password.length > 0) && (
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { ok: rules.length, label: 'MÃ­nimo de 8 caracteres' },
                  { ok: rules.upper, label: 'Pelo menos uma letra maiÃºscula' },
                  { ok: rules.special, label: 'Pelo menos um caractere especial (!@#$%...)' },
                ].map((rule, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: rule.ok ? '#16a34a' : '#6b7280', fontWeight: rule.ok ? 600 : 400 }}>
                    <span style={{ width: 16, height: 16, borderRadius: '50%', background: rule.ok ? '#dcfce7' : '#f3f4f6', border: `1.5px solid ${rule.ok ? '#16a34a' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 10 }}>
                      {rule.ok ? 'â' : ''}
                    </span>
                    {rule.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="fg">
            <label>Confirmar senha</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onBlur={() => setTouchedConfirm(true)}
                placeholder="Repita a senha"
                style={{ paddingRight: 44, borderColor: touchedConfirm && confirmPassword && confirmPassword !== password ? '#dc2626' : undefined }}
              />
              <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {touchedConfirm && confirmPassword && confirmPassword !== password && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 5 }}>
                â ï¸ As senhas nÃ£o coincidem
              </div>
            )}
            {touchedConfirm && confirmPassword && confirmPassword === password && allRulesOk && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                â Senhas coincidem
              </div>
            )}
          </div>

          {error && <div className="auth-error">â ï¸ {error}</div>}
          {success && (
            <div className="auth-success">
              â {success}
              <div style={{ marginTop: 10 }}>
                <button type="button" className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => goToPage('login')}>
                  Ir para o login â
                </button>
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, lineHeight: 1.5 }}>
            Ao criar uma conta vocÃª concorda com nossos{' '}
            <a onClick={() => goToPage('terms')} style={{ color: '#5aa800', cursor: 'pointer', textDecoration: 'underline' }}>Termos de Uso e PolÃ­tica de Privacidade</a>.
          </p>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 13, marginTop: 4, fontSize: 15 }} disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar conta e comeÃ§ar'}
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f3f4f6', textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
          JÃ¡ tem conta?{' '}
          <a onClick={() => goToPage('login')} style={{ color: '#5aa800', fontWeight: 600, cursor: 'pointer' }}>Entrar</a>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
          <a onClick={() => goToPage('home')} style={{ color: '#9ca3af', cursor: 'pointer' }}>â Voltar para a home</a>
        </div>
      </div>
    </div>
  )
}
