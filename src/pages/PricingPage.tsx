import { useState } from 'react'
import type { Page } from '../App'

interface Props { goToPage: (page: Page) => void }

export default function PricingPage({ goToPage }: Props) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const plans = [
    {
      id: 'espacos', icon: '🏢', name: 'Espaços',
      tag: null, monthly: 59, highlight: false,
      color: '#0ea5e9',
      desc: 'Para quem anuncia espaços — salões, chácaras, buffets, restaurantes e hotéis.',
      features: [
        { text: 'Anúncios de espaços ilimitados', ok: true },
        { text: 'Fotos e vídeos no perfil', ok: true },
        { text: 'Orçamentos ilimitados', ok: true },
        { text: 'Notificação por email e WhatsApp', ok: true },
        { text: 'Painel de gerenciamento', ok: true },
        { text: 'Avaliações verificadas', ok: true },
        { text: 'Badge "Verificado Ewind"', ok: false },
        { text: 'Destaque nas buscas', ok: false },
        { text: 'Painel de fornecedor', ok: false },
      ],
      cta: 'Começar com Espaços',
    },
    {
      id: 'pro', icon: '⭐', name: 'Pro — Completo',
      tag: 'MAIS ESCOLHIDO', monthly: 89, highlight: true,
      color: '#a3e635',
      desc: 'Espaços + Fornecedor na mesma conta. Para quem atua nas duas frentes.',
      features: [
        { text: 'Anúncios de espaços ilimitados', ok: true },
        { text: 'Perfil de fornecedor de serviços', ok: true },
        { text: 'Orçamentos ilimitados nos dois painéis', ok: true },
        { text: 'Notificação por email e WhatsApp', ok: true },
        { text: 'Painel de gerenciamento completo', ok: true },
        { text: 'Avaliações verificadas', ok: true },
        { text: 'Badge "Verificado Ewind"', ok: true },
        { text: 'Destaque nas buscas', ok: true },
        { text: 'Economize vs contratar os dois separados', ok: true },
      ],
      cta: 'Começar com Pro',
    },
    {
      id: 'fornecedor', icon: '🛠️', name: 'Fornecedor',
      tag: null, monthly: 49, highlight: false,
      color: '#8b5cf6',
      desc: 'Para fotógrafos, DJs, decoradores, confeiteiros e prestadores de serviços.',
      features: [
        { text: 'Perfil de fornecedor completo', ok: true },
        { text: 'Fotos e portfólio', ok: true },
        { text: 'Orçamentos ilimitados', ok: true },
        { text: 'Notificação por email e WhatsApp', ok: true },
        { text: 'Painel de gerenciamento', ok: true },
        { text: 'Avaliações verificadas', ok: true },
        { text: 'Badge "Verificado Ewind"', ok: false },
        { text: 'Destaque nas buscas', ok: false },
        { text: 'Painel de espaços', ok: false },
      ],
      cta: 'Começar com Fornecedor',
    },
  ]

  const getPrice = (m: number) => billing === 'annual' ? Math.round(m * 0.80) : m
  const getSaving = (m: number) => Math.round(m * 0.20 * 12)

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  const faqs = [
    { q: 'Por quanto tempo meu anúncio fica ativo gratuitamente?', a: 'Todos os novos anunciantes têm 90 dias gratuitos a partir da data de publicação. Após esse período, é necessário assinar um plano para manter a visibilidade.' },
    { q: 'O que acontece se eu não assinar após os 90 dias?', a: 'Seu anúncio fica pausado e deixa de aparecer nas buscas. Assim que você assinar, ele volta imediatamente. Nenhum dado é perdido.' },
    { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Não há fidelidade. Você cancela quando quiser e o anúncio é pausado ao final do período pago.' },
    { q: 'O Plano Pro vale a pena vs contratar os dois separados?', a: 'Espaços (R$59) + Fornecedor (R$49) separados custam R$108/mês. O Pro sai por R$89 — economia de R$19/mês ou R$228/ano, e ainda inclui badge verificado e destaque nas buscas.' },
    { q: 'Quem entra agora como Early Adopter tem benefício?', a: 'Sim. Early adopters terão desconto exclusivo permanente nos planos pagos — condições melhores do que quem entrar depois do lançamento oficial.' },
    { q: 'O Ewind cobra comissão sobre eventos fechados?', a: 'Não. Apenas a assinatura mensal. Você negocia e fecha diretamente com o cliente — sem comissão sobre nada.' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      {/* HERO */}
      <div style={{ background: '#111', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#a3e635', color: '#1a2e05', fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 18 }}>
          Early Adopter — 90 dias grátis
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.1, letterSpacing: '-.02em' }}>
          Simples, transparente,<br /><span style={{ color: '#a3e635' }}>sem comissão.</span>
        </h1>
        <p style={{ fontSize: 15, color: '#9ca3af', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.65 }}>
          Pague só a assinatura. Feche quantos eventos quiser sem pagar nada extra.
        </p>
        <div style={{ display: 'inline-flex', background: '#1a1a1a', borderRadius: 100, padding: 4, gap: 4 }}>
          {(['monthly', 'annual'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{ padding: '8px 20px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, transition: 'all .2s', background: billing === b ? (b === 'annual' ? '#a3e635' : '#fff') : 'transparent', color: billing === b ? (b === 'annual' ? '#1a2e05' : '#111') : '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
              {b === 'monthly' ? 'Mensal' : <><span>Anual</span><span style={{ fontSize: 10, background: billing === 'annual' ? '#1a2e05' : '#333', color: billing === 'annual' ? '#a3e635' : '#aaa', padding: '2px 7px', borderRadius: 100 }}>-20%</span></>}
            </button>
          ))}
        </div>
      </div>

      {/* CARDS */}
      <div style={{ maxWidth: 980, margin: '-28px auto 0', padding: '0 20px 56px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {plans.map(plan => (
          <div key={plan.id} style={{ background: '#fff', borderRadius: 16, border: plan.highlight ? `2px solid ${plan.color}` : '1px solid #e8e8e8', overflow: 'hidden', boxShadow: plan.highlight ? `0 8px 28px ${plan.color}22` : '0 2px 8px rgba(0,0,0,0.05)', position: 'relative', transform: plan.highlight ? 'translateY(-8px)' : 'none' }}>
            {plan.tag && (
              <div style={{ background: plan.color, color: plan.id === 'pro' ? '#1a2e05' : '#fff', textAlign: 'center', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', padding: '6px 0' }}>{plan.tag}</div>
            )}
            <div style={{ padding: '26px 24px 22px' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{plan.icon}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#111', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, marginBottom: 18 }}>{plan.desc}</div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>R$</span>
                  <span style={{ fontSize: 40, fontWeight: 900, color: plan.highlight ? plan.color : '#111', lineHeight: 1 }}>{getPrice(plan.monthly)}</span>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>/mês</span>
                </div>
                {billing === 'annual' && <div style={{ fontSize: 11, color: '#16a34a', marginTop: 3, fontWeight: 600 }}>Você economiza R${getSaving(plan.monthly)} por ano</div>}
                {plan.id === 'pro' && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>vs R${getPrice(59) + getPrice(49)}/mês comprando separado</div>}
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e8e8e8', borderRadius: 8, padding: '7px 12px', marginBottom: 18, fontSize: 11, color: '#6b7280' }}>
                ✓ <strong>90 dias grátis</strong> para novos anunciantes
              </div>
              <button onClick={() => goToPage('signup')} style={{ width: '100%', padding: 13, fontSize: 14, fontWeight: 800, background: plan.highlight ? plan.color : '#111', color: plan.highlight ? '#1a2e05' : '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 18 }}>
                {plan.cta} →
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 13, flexShrink: 0, color: f.ok ? (plan.highlight ? plan.color : '#16a34a') : '#d1d5db', fontWeight: 700 }}>{f.ok ? '✓' : '✕'}</span>
                    <span style={{ fontSize: 12.5, color: f.ok ? '#2d2d2d' : '#9ca3af' }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COMPARATIVO */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 56px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 28 }}>Por que o <span style={{ color: '#a3e635' }}>Pro</span> vale a pena?</h2>
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111' }}>
                {['Recurso', 'Espaços', 'Pro ⭐', 'Fornecedor'].map((h, i) => (
                  <th key={i} style={{ padding: '13px 16px', textAlign: i === 0 ? 'left' : 'center', fontSize: 12, fontWeight: 700, color: i === 2 ? '#a3e635' : '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Anúncios de espaços', '✓', '✓', '—'],
                ['Perfil de fornecedor', '—', '✓', '✓'],
                ['Badge Verificado', '—', '✓', '—'],
                ['Destaque nas buscas', '—', '✓', '—'],
                ['Orçamentos ilimitados', '✓', '✓', '✓'],
                ['Notificações', '✓', '✓', '✓'],
                ['Avaliações', '✓', '✓', '✓'],
                ['Preço mensal', `R$${getPrice(59)}`, `R$${getPrice(89)}`, `R$${getPrice(49)}`],
              ].map(([feat, esp, pro, forn], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#2d2d2d', fontWeight: 500 }}>{feat}</td>
                  {[esp, pro, forn].map((v, j) => (
                    <td key={j} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: j === 1 ? 800 : v === '—' ? 400 : 700, color: j === 1 ? '#a3e635' : v === '—' ? '#d1d5db' : '#16a34a', background: j === 1 ? '#f0fdf4' : 'transparent' }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EARLY ADOPTER */}
      <div style={{ background: '#111', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 30, marginBottom: 10 }}>🚀</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Seja um <span style={{ color: '#a3e635' }}>Early Adopter</span></h2>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.65, marginBottom: 22 }}>
            90 dias grátis + <strong style={{ color: '#fff' }}>desconto exclusivo garantido</strong> para sempre enquanto mantiver a assinatura ativa.
          </p>
          {!submitted ? (
            <form onSubmit={handleNotify} style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com"
                style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, fontFamily: 'inherit' }} />
              <button type="submit" disabled={loading}
                style={{ padding: '12px 18px', background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {loading ? '...' : 'Avisar quando abrir →'}
              </button>
            </form>
          ) : (
            <div style={{ background: '#1a2e05', border: '1px solid #a3e635', borderRadius: 12, padding: '14px 22px', color: '#a3e635', fontWeight: 700, fontSize: 14 }}>
              ✅ Anotado! Você será o primeiro a saber quando os planos abrirem.
            </div>
          )}
          <p style={{ fontSize: 11, color: '#444', marginTop: 10 }}>Sem spam. Apenas o aviso quando os planos pagos forem lançados.</p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '56px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 28 }}>Perguntas frequentes</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
        </div>
      </div>

    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '15px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color: '#9ca3af', flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <div style={{ padding: '0 18px 14px', fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{a}</div>}
    </div>
  )
}
