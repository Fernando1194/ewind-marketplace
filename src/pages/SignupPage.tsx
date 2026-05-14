import { useState, useMemo } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

type Role = 'guest' | 'host' | 'supplier'

export default function SignupPage({ goToPage }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('guest')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [extraRoles, setExtraRoles] = useState<string[]>([])

  const passwordChecks = useMemo(() => ({
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password])

  const passwordValid = Object.values(passwordChecks).every(Boolean)
  const passwordsMatch = password === confirm && confirm.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Por favor, informe seu nome.'); return }
    if (!passwordValid) { setError('A senha não atende aos requisitos mínimos.'); return }
    if (!passwordsMatch) { setError('As senhas não coincidem.'); return }
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: name.trim() } }
      })
      if (signUpError) throw signUpError
      if (data.user) {
        const finalRole = extraRoles.includes('host') ? 'host' : extraRoles.includes('supplier') ? 'supplier' : role
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          role: finalRole,
          is_host: extraRoles.includes('host') || role === 'host',
          is_supplier: extraRoles.includes('supplier') || role === 'supplier',
          updated_at: new Date().toISOString(),
        })
        if (profileError) console.error('Profile error:', profileError)
      }
      setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.')
    } catch (err: any) {
      if (err.message?.includes('already registered') || err.message?.includes('already been registered')) {
        setError('Este email já está cadastrado. Tente fazer login.')
      } else if (err.message?.includes('email rate limit')) {
        setError('Muitos cadastros em pouco tempo. Aguarde alguns minutos.')
      } else {
        setError(err.message || 'Erro ao criar conta.')
      }
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ maxWidth: 440, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✉️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Confirme seu email</h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>{success}</p>
        <button onClick={() => goToPage('login')} className="btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
          Ir para o login →
        </button>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 440, margin: '48px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Criar conta gratuita</h1>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>Faça parte do marketplace de eventos do Brasil</p>

      <form onSubmit={handleSubmit}>
        {/* Tipo de perfil */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
            Como você vai usar o Ewind?
          </label>
          {([
            { value: 'guest', icon: '🎉', title: 'Preciso de um espaço', desc: 'Quero encontrar, comparar e solicitar orçamentos para o meu evento' },
            { value: 'host', icon: '🏢', title: 'Tenho um espaço para locar', desc: 'Quero anunciar meu espaço e receber solicitações de orçamento qualificadas' },
            { value: 'supplier', icon: '🛠️', title: 'Ofereço serviços para eventos', desc: 'Sou fotógrafo, DJ, buffet, decorador, cerimonialista ou outro fornecedor' },
          ] as { value: Role; icon: string; title: string; desc: string }[]).map(opt => (
            <div key={opt.value}
              onClick={() => setRole(opt.value)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 10, border: `2px solid ${role === opt.value ? '#a3e635' : '#e8e8e8'}`, background: role === opt.value ? '#f0fdf4' : '#fff', cursor: 'pointer', marginBottom: 8, transition: 'all .15s' }}>
              <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{opt.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>{opt.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
              {role === opt.value && <span style={{ color: '#5aa800', fontSize: 18, flexShrink: 0, marginTop: 4 }}>✓</span>}
            </div>
          ))}
        </div>

        <div className="fg">
          <label>Nome completo</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" required />
        </div>

        <div className="fg">
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
        </div>

        <div className="fg">
          <label>Senha</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowPass(p => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' }}>
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          {password.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                { ok: passwordChecks.length, label: 'Mínimo de 8 caracteres' },
                { ok: passwordChecks.upper, label: 'Pelo menos uma letra maiúscula' },
                { ok: passwordChecks.special, label: 'Pelo menos um caractere especial (!@#$%...)' },
              ].map((c, i) => (
                <div key={i} style={{ fontSize: 12, color: c.ok ? '#16a34a' : '#9ca3af', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{c.ok ? '✅' : '⬜'}</span> {c.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fg">
          <label>Confirmar senha</label>
          <div style={{ position: 'relative' }}>
            <input type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repita a senha" required style={{ paddingRight: 44 }} />
            <button type="button" onClick={() => setShowConfirm(p => !p)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#9ca3af' }}>
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
          {confirm.length > 0 && (
            <div style={{ fontSize: 12, marginTop: 6, color: passwordsMatch ? '#16a34a' : '#dc2626' }}>
              {passwordsMatch ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
            ⚠️ {error}
          </div>
        )}

        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, lineHeight: 1.5 }}>
          Ao criar uma conta você concorda com nossos{' '}
          <a onClick={() => goToPage('terms')} style={{ color: '#5aa800', cursor: 'pointer', textDecoration: 'underline' }}>
            Termos de Uso e Política de Privacidade
          </a>.
        </p>

        <button type="submit" disabled={loading || !passwordValid || !passwordsMatch} className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Criando conta...' : 'Criar conta e começar'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
        Já tem conta?{' '}
        <a onClick={() => goToPage('login')} style={{ color: '#5aa800', fontWeight: 600, cursor: 'pointer' }}>Entrar</a>
      </p>
      <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13 }}>
        <a onClick={() => goToPage('home')} style={{ color: '#9ca3af', cursor: 'pointer' }}>← Voltar para a home</a>
      </p>
    </div>
  )
}
