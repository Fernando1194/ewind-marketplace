import { useState } from 'react'
import { supabase } from '../supabase'
import { SUPPLIER_CATEGORIES } from '../types'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

export default function SupplierSignupPage({ goToPage }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres'); return }
    if (!category) { setError('Selecione sua categoria de serviço'); return }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name, role: 'supplier', supplier_category: category } }
      })
      if (error) throw error
      if (data.user) {
        setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.')
        setName(''); setEmail(''); setPassword(''); setCategory('')
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f9fafb', display: 'flex' }}>

      {/* Lado esquerdo */}
      <div style={{ width: '42%', background: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="supplier-side">
        <div onClick={() => goToPage('home')} style={{ cursor: 'pointer', display: 'inline-block', marginBottom: 28 }}>
          <div className="logo-box">EWIND</div>
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: '#a3e635', lineHeight: 1.25, marginBottom: 14 }}>
          Seja encontrado por quem está organizando o evento perfeito
        </h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, marginBottom: 32 }}>
          No Ewind, profissionais de eventos têm um espaço dedicado para apresentar seu trabalho, exibir seu portfólio e receber contatos qualificados — de forma gratuita.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '📸', text: 'Portfólio com fotos e vídeos do seu trabalho' },
            { icon: '💬', text: 'Clientes entram em contato direto via WhatsApp ou Instagram' },
            { icon: '📍', text: 'Apareça para eventos na sua cidade e região' },
            { icon: '💸', text: 'Gratuito para criar e manter seu perfil' },
            { icon: '⚡', text: 'Perfil ativo em menos de 10 minutos' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 20 }}>{item.icon}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>{item.text}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Já tem conta?</p>
          <button onClick={() => goToPage('supplier-login')} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 600, background: 'transparent', border: '1.5px solid rgba(163,230,53,0.5)', borderRadius: 8, color: '#a3e635', cursor: 'pointer', fontFamily: 'inherit' }}>
            Entrar na minha conta →
          </button>
        </div>
      </div>

      {/* Lado direito */}
      <div style={{ flex: 1, padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}>
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>Criar perfil de fornecedor</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 28 }}>
            Preencha os dados abaixo e comece a aparecer para quem organiza eventos.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="fg">
              <label>Sua especialidade *</label>
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Selecione a categoria que melhor descreve seu serviço</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 6 }}>
                {SUPPLIER_CATEGORIES.map(c => (
                  <button key={c.name} type="button" onClick={() => setCategory(c.name)}
                    style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600, border: category === c.name ? '2px solid #a3e635' : '1.5px solid #e8e8e8', borderRadius: 8, background: category === c.name ? '#f0fdf4' : '#fff', color: category === c.name ? '#1a2e05' : '#4b5563', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="fg">
              <label>Nome profissional ou empresa *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva Fotografia, Buffet Sabor & Arte" />
            </div>
            <div className="fg">
              <label>Email *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="contato@seunegocio.com.br" />
            </div>
            <div className="fg">
              <label>Senha *</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" minLength={6} />
            </div>

            {error && <div className="auth-error">⚠️ {error}</div>}
            {success && (
              <div className="auth-success">
                ✅ {success}
                <div style={{ marginTop: 10 }}>
                  <button type="button" className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => goToPage('supplier-login')}>
                    Ir para o login →
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: 14, marginTop: 12, fontSize: 15 }} disabled={loading}>
              {loading ? 'Criando perfil...' : '🛠️ Criar meu perfil de fornecedor'}
            </button>
          </form>

          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            Precisa de um espaço?{' '}
            <a onClick={() => goToPage('signup')} style={{ color: '#5aa800', fontWeight: 600, cursor: 'pointer' }}>Cadastro de cliente →</a>
          </div>
          <div style={{ marginTop: 8, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
            <a onClick={() => goToPage('home')} style={{ color: '#9ca3af', cursor: 'pointer' }}>← Voltar para a home</a>
          </div>
        </div>
      </div>
    </div>
  )
}
