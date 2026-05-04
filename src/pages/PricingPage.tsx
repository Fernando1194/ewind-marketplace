import { useState } from 'react'
import type { Page } from '../App'

interface Props {
  goToPage: (page: Page) => void
}

export default function PricingPage({ goToPage }: Props) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simula envio — aqui pode integrar com Mailchimp, Resend, etc.
    await new Promise(r => setTimeout(r, 1000))
    setSubmitted(true)
    setLoading(false)
  }

  const plans = [
    {
      id: 'gratuito',
      icon: '🌱',
      name: 'Gratuito',
      tag: null,
      price: 'R$ 0',
      period: 'para sempre',
      desc: 'Para quem está começando e quer experimentar a plataforma.',
      features: [
        '1 anúncio ativo',
        'Fotos e vídeos no perfil',
        'Receba orçamentos ilimitados',
        'Responda com proposta',
        'Contato via WhatsApp e Instagram',
        'Painel de gerenciamento',
      ],
      locked: [],
      cta: 'Começar grátis',
      ctaAction: 'signup',
      highlight: false,
    },
    {
      id: 'profissional',
      icon: '🚀',
      name: 'Profissional',
      tag: 'EM BREVE',
      price: 'R$ ??',
      period: 'por mês',
      desc: 'Para anunciantes que querem mais visibilidade e recursos.',
      features: [
        'Anúncios ilimitados',
        'Destaque na listagem',
        'Selo "Verificado" no perfil',
        'Estatísticas de visualizações',
        'Respostas automáticas',
        'Suporte prioritário',
        'Integração com agenda',
        'Link personalizado do perfil',
      ],
      locked: ['Destaque na listagem', 'Estatísticas de visualizações', 'Respostas automáticas', 'Integração com agenda'],
      cta: 'Quero ser avisado',
      ctaAction: 'notify',
      highlight: true,
    },
    {
      id: 'premium',
      icon: '👑',
      name: 'Premium',
      tag: 'EM BREVE',
      price: 'R$ ??',
      period: 'por mês',
      desc: 'Para profissionais e empresas que precisam do máximo.',
      features: [
        'Tudo do Profissional',
        'Múltiplos usuários',
        'API de integração',
        'Relatórios avançados',
        'Gestor de conta dedicado',
        'Personalização da página',
        'Destaque nas buscas patrocinado',
        'Dashboard analítico completo',
      ],
      locked: ['API de integração', 'Relatórios avançados', 'Gestor de conta dedicado', 'Destaque nas buscas patrocinado', 'Dashboard analítico completo'],
      cta: 'Quero ser avisado',
      ctaAction: 'notify',
      highlight: false,
    }
  ]

  return (
    <div style={{ background: '#f9fafb' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(163,230,53,0.15)', border: '1px solid rgba(163,230,53,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 20 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a3e635', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#a3e635', letterSpacing: '0.08em' }}>ACESSO ANTECIPADO GRATUITO</span>
          </div>

          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
            Comece grátis.<br />
            <span style={{ color: '#a3e635' }}>Pague quando valer a pena.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
            O Ewind está em fase de lançamento. Todos os anunciantes que entrarem agora têm acesso gratuito e ilimitado enquanto construímos a plataforma juntos.
          </p>

          {/* Early adopter badge */}
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #a3e635, #5aa800)', borderRadius: 16, padding: '20px 32px' }}>
            <div style={{ fontSize: 32, marginBottom: 6 }}>⚡</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1a2e05', marginBottom: 4 }}>Early Adopter</div>
            <div style={{ fontSize: 13, color: '#1a2e05', opacity: 0.8 }}>Benefício exclusivo para os primeiros usuários</div>
          </div>
        </div>
      </section>

      {/* BANNER EARLY ADOPTER */}
      <section style={{ background: '#f0fdf4', borderTop: '1px solid #d9f99d', borderBottom: '1px solid #d9f99d', padding: '28px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>🎁</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1a2e05', marginBottom: 4 }}>
                Você é Early Adopter — tudo grátis enquanto lançamos!
              </div>
              <div style={{ fontSize: 14, color: '#365314', lineHeight: 1.6 }}>
                Quem entrar agora terá condições especiais quando os planos pagos forem lançados. <strong>Garantia de desconto exclusivo</strong> para quem ajudou a construir o Ewind desde o início.
              </div>
            </div>
          </div>
          <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '12px 24px', fontSize: 14 }} onClick={() => goToPage('signup')}>
            Garantir meu acesso →
          </button>
        </div>
      </section>

      {/* PLANOS */}
      <section style={{ padding: '64px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Nossos planos</h2>
          <p style={{ fontSize: 15, color: '#6b7280' }}>Os valores dos planos pagos serão revelados em breve</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                background: '#fff',
                borderRadius: 20,
                border: plan.highlight ? '2px solid #a3e635' : '1.5px solid #e8e8e8',
                padding: '32px 28px',
                position: 'relative',
                transition: 'transform 0.2s, box-shadow 0.2s',
                transform: hoveredPlan === plan.id ? 'translateY(-4px)' : 'none',
                boxShadow: hoveredPlan === plan.id ? '0 12px 32px rgba(0,0,0,0.1)' : plan.highlight ? '0 4px 20px rgba(163,230,53,0.15)' : 'none'
              }}
            >
              {/* Badge destaque */}
              {plan.highlight && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#a3e635', color: '#1a2e05', fontSize: 11, fontWeight: 800, padding: '4px 16px', borderRadius: 100, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>
                  MAIS POPULAR
                </div>
              )}

              {/* Tag em breve */}
              {plan.tag && (
                <div style={{ position: 'absolute', top: 20, right: 20, background: '#1a1a1a', color: '#a3e635', fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 100, letterSpacing: '0.08em' }}>
                  {plan.tag}
                </div>
              )}

              <div style={{ fontSize: 36, marginBottom: 12 }}>{plan.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 1.6 }}>{plan.desc}</p>

              {/* Preço */}
              <div style={{ marginBottom: 24, padding: '16px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>
                {plan.id === 'gratuito' ? (
                  <div>
                    <span style={{ fontSize: 36, fontWeight: 900, color: '#2d2d2d' }}>R$ 0</span>
                    <span style={{ fontSize: 14, color: '#9ca3af', marginLeft: 6 }}>/ para sempre</span>
                  </div>
                ) : (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div style={{ fontSize: 36, fontWeight: 900, color: '#2d2d2d', filter: 'blur(8px)', userSelect: 'none' }}>
                      R$ 99
                    </div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ background: '#1a1a1a', color: '#a3e635', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 8, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        🔒 EM BREVE
                      </div>
                    </div>
                  </div>
                )}
                {plan.id === 'gratuito' && (
                  <div style={{ fontSize: 12, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                    ✓ Gratuito durante o período de lançamento
                  </div>
                )}
              </div>

              {/* Features */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {plan.features.map((f, i) => {
                  const isLocked = plan.locked.includes(f)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: isLocked ? '#d1d5db' : '#2d2d2d' }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                        background: isLocked ? '#f3f4f6' : '#dcfce7',
                        color: isLocked ? '#d1d5db' : '#16a34a',
                        fontWeight: 800
                      }}>
                        {isLocked ? '🔒' : '✓'}
                      </span>
                      <span style={{ filter: isLocked ? 'blur(3px)' : 'none', userSelect: isLocked ? 'none' : 'auto' }}>
                        {f}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* CTA */}
              {plan.ctaAction === 'signup' ? (
                <button
                  className="btn-primary"
                  style={{ width: '100%', padding: 13, fontSize: 14 }}
                  onClick={() => goToPage('signup')}
                >
                  {plan.cta}
                </button>
              ) : (
                <button
                  style={{
                    width: '100%', padding: 13, fontSize: 14, fontWeight: 700,
                    background: plan.highlight ? '#f0fdf4' : '#f9fafb',
                    border: `1.5px solid ${plan.highlight ? '#a3e635' : '#e8e8e8'}`,
                    borderRadius: 10, cursor: 'pointer', color: plan.highlight ? '#1a2e05' : '#6b7280',
                    fontFamily: 'inherit'
                  }}
                  onClick={() => document.getElementById('notify-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  🔔 {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* O QUE ESTÁ INCLUÍDO GRÁTIS AGORA */}
      <section style={{ padding: '0 24px 64px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', background: '#1a1a1a', borderRadius: 20, padding: '48px 40px' }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 8, textAlign: 'center' }}>
            O que está disponível <span style={{ color: '#a3e635' }}>gratuitamente agora</span>
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 36 }}>
            Durante o período de lançamento, todos os usuários têm acesso completo
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { icon: '🏢', text: 'Cadastrar espaços e serviços' },
              { icon: '📸', text: 'Fotos e vídeos no perfil' },
              { icon: '💬', text: 'Receber e responder orçamentos' },
              { icon: '🔍', text: 'Aparecer nas buscas' },
              { icon: '📊', text: 'Painel de gerenciamento' },
              { icon: '🔗', text: 'Links de redes sociais' },
              { icon: '🗺️', text: 'Mapa do espaço' },
              { icon: '📱', text: 'Acesso mobile e desktop' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(163,230,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULÁRIO EARLY ADOPTER */}
      <section id="notify-form" style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            Seja um Early Adopter
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.7, marginBottom: 8 }}>
            Cadastre seu email para ser o primeiro a saber quando os planos pagos forem lançados — e garantir um <strong>desconto exclusivo de early adopter</strong>.
          </p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 32 }}>
            Sem spam. Você receberá apenas novidades importantes do Ewind.
          </p>

          {submitted ? (
            <div style={{ background: '#f0fdf4', border: '1.5px solid #a3e635', borderRadius: 16, padding: '32px 28px' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a2e05', marginBottom: 8 }}>
                Você está na lista!
              </h3>
              <p style={{ fontSize: 14, color: '#365314', lineHeight: 1.6, marginBottom: 20 }}>
                Obrigado por fazer parte do Ewind desde o início. Você será o primeiro a saber quando os planos pagos forem lançados — com condições especiais garantidas.
              </p>
              <button className="btn-primary" onClick={() => goToPage('signup')}>
                Criar minha conta gratuita →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, maxWidth: 480, margin: '0 auto' }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{ flex: 1, padding: '13px 16px', border: '1.5px solid #e8e8e8', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ whiteSpace: 'nowrap', padding: '13px 20px', fontSize: 14 }}
                disabled={loading}
              >
                {loading ? 'Enviando...' : '⚡ Quero desconto'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ PREÇOS */}
      <section style={{ background: '#fff', borderTop: '1px solid #e8e8e8', padding: '64px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 32 }}>Perguntas frequentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { q: 'Quando os planos pagos serão lançados?', a: 'Estamos construindo a plataforma e definindo os valores com base no feedback dos primeiros usuários. Em breve anunciaremos os planos com antecedência.' },
              { q: 'Quem entrar agora vai ter que pagar depois?', a: 'Os early adopters terão condições especiais quando os planos forem lançados. Você será notificado com antecedência e terá garantia de desconto por ter apoiado o Ewind desde o início.' },
              { q: 'O plano gratuito vai continuar existindo?', a: 'Sim! O plano gratuito continuará disponível para sempre. Ele permite cadastrar 1 anúncio e receber orçamentos ilimitados — suficiente para quem está começando.' },
              { q: 'Quem recebe orçamentos paga alguma taxa?', a: 'Não. O Ewind nunca cobra comissão sobre orçamentos, negociações ou contratos fechados. Os pagamentos acontecem diretamente entre cliente e anunciante.' },
              { q: 'E para quem busca espaços, é gratuito?', a: 'Sim, buscar espaços, comparar e solicitar orçamentos é e sempre será gratuito. Os planos pagos são voltados exclusivamente para anunciantes.' },
            ].map((faq, i) => (
              <div key={i} style={{ background: '#f9fafb', borderRadius: 12, padding: '20px 24px', border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#2d2d2d' }}>
                  {faq.q}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
