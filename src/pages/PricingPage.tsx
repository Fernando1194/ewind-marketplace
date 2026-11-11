import { useState } from 'react'
import type { Page } from '../App'
import { supabase } from '../supabase'
import { useCopy } from '../i18n'
import { PRICING } from '../i18n/pricing'

interface Props { goToPage: (page: Page) => void }

export default function PricingPage({ goToPage }: Props) {
  const c = useCopy(PRICING)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [notifyError, setNotifyError] = useState('')

  const base = [
    { id: 'espacos', icon: '🏢', highlight: false, color: '#0ea5e9', oks: [true, true, true, true, true, true, false, false, false] },
    { id: 'pro', icon: '⭐', highlight: true, color: '#a3e635', oks: [true, true, true, true, true, true, true, true, true] },
    { id: 'fornecedor', icon: '🛠️', highlight: false, color: '#8b5cf6', oks: [true, true, true, true, true, true, false, false, false] },
  ]
  const plans = base.map((b, k) => {
    const t = c.plans[k] as { name: string; desc: string; cta: string; tag?: string; features: string[] }
    return { ...b, name: t.name, desc: t.desc, cta: t.cta, tag: t.tag ?? null, features: t.features.map((text, n) => ({ text, ok: b.oks[n] })) }
  })

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotifyError('')
    setLoading(true)
    const { error } = await supabase.from('plan_waitlist').insert({ email: email.trim() })
    // 23505 = email já estava na lista: tratamos como sucesso para não revelar quem já se inscreveu
    if (error && error.code !== '23505') setNotifyError(c.notifyErr)
    else setSubmitted(true)
    setLoading(false)
  }

  const faqs = c.faqs

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>

      {/* HERO */}
      <div style={{ background: '#111', padding: '64px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: '#a3e635', color: '#1a2e05', fontSize: 10, fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100, marginBottom: 18 }}>
          {c.heroBadge}
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', marginBottom: 12, lineHeight: 1.1, letterSpacing: '-.02em' }}>
          {c.h1a}<br /><span style={{ color: '#a3e635' }}>{c.h1b}</span>
        </h1>
        <p style={{ fontSize: 15, color: '#9ca3af', maxWidth: 520, margin: '0 auto 28px', lineHeight: 1.65 }}>
          {c.heroA} <strong style={{ color: '#fff' }}>{c.advertisers}</strong>{c.heroB}
        </p>
        <button onClick={() => goToPage('events')} style={{ background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 10, padding: '13px 30px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 28 }}>
          {c.createEvent}
        </button>
        <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 700, marginBottom: 16 }}>{c.plansFor}</div>
      </div>

      {/* CARDS */}
      {/* AVISO FASE DE TESTES */}
      <div style={{ maxWidth: 980, margin: '24px auto 0', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <div role="note" style={{ background: '#f7fee7', border: '1px solid #bef264', borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }} aria-hidden>🧪</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1a2e05', marginBottom: 2 }}>{c.noteTitle}</div>
            <div style={{ fontSize: 13, color: '#3f6212', lineHeight: 1.55 }}>{c.noteText}</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 980, margin: '24px auto 0', padding: '0 20px 56px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
        {plans.map(plan => (
          <div key={plan.id} style={{ background: '#fff', borderRadius: 16, border: plan.highlight ? `2px solid ${plan.color}` : '1px solid #e8e8e8', overflow: 'hidden', boxShadow: plan.highlight ? `0 8px 28px ${plan.color}22` : '0 2px 8px rgba(0,0,0,0.05)', position: 'relative', transform: plan.highlight ? 'translateY(-8px)' : 'none' }}>
            {plan.tag && (
              <div style={{ background: plan.color, color: plan.id === 'pro' ? '#1a2e05' : '#fff', textAlign: 'center', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', padding: '6px 0' }}>{plan.tag}</div>
            )}
            <div style={{ padding: '26px 24px 22px' }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{plan.icon}</div>
              <div style={{ fontSize: 19, fontWeight: 800, color: '#111', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, marginBottom: 18 }}>{plan.desc}</div>
              <div style={{ marginBottom: 6 }} title={c.priceSoon}>
                {/* valor real não vai para a página: o blur é sobre um número de enfeite */}
                <div aria-label={c.priceSoon} style={{ display: 'flex', alignItems: 'baseline', gap: 3, filter: 'blur(9px)', userSelect: 'none' }}>
                  <span aria-hidden style={{ fontSize: 13, color: '#9ca3af' }}>R$</span>
                  <span aria-hidden style={{ fontSize: 40, fontWeight: 900, color: plan.highlight ? plan.color : '#111', lineHeight: 1 }}>00</span>
                  <span aria-hidden style={{ fontSize: 13, color: '#9ca3af' }}>{c.perMonth}</span>
                </div>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e8e8e8', borderRadius: 8, padding: '7px 12px', marginBottom: 18, fontSize: 11, color: '#6b7280' }}>
                🟢 <strong>{c.freeEA}</strong> · {c.planned}
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
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 28 }}>{c.whyPro} <span style={{ color: '#a3e635' }}>Pro</span> {c.worth}</h2>
        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111' }}>
                {[c.feature, plans[0].name, 'Pro ⭐', plans[2].name].map((h, i) => (
                  <th key={i} style={{ padding: '13px 16px', textAlign: i === 0 ? 'left' : 'center', fontSize: 12, fontWeight: 700, color: i === 2 ? '#a3e635' : '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [c.cmp[0], '✓', '✓', '—'],
                [c.cmp[1], '—', '✓', '✓'],
                [c.cmp[2], '—', '✓', '—'],
                [c.cmp[3], '—', '✓', '—'],
                [c.cmp[4], '✓', '✓', '✓'],
                [c.cmp[5], '✓', '✓', '✓'],
                [c.cmp[6], '✓', '✓', '✓'],
                [c.price, 'R$ 00', 'R$ 00', 'R$ 00'],
              ].map(([feat, esp, pro, forn], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#2d2d2d', fontWeight: 500 }}>{feat}</td>
                  {[esp, pro, forn].map((v, j) => (
                    <td key={j} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: j === 1 ? 800 : v === '—' ? 400 : 700, color: j === 1 ? '#a3e635' : v === '—' ? '#d1d5db' : '#16a34a', background: j === 1 ? '#f0fdf4' : 'transparent' }}>{v === 'R$ 00' ? <span aria-label={c.priceSoon} style={{ filter: 'blur(6px)', userSelect: 'none' }}>{v}</span> : v}</td>
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
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 10 }}>{c.eaTitleA} <span style={{ color: '#a3e635' }}>{c.eaTitleB}</span></h2>
          <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.65, marginBottom: 22 }}>
{c.eaP1} <strong style={{ color: '#fff' }}>{c.eaStrong}</strong> {c.eaP2}
          </p>
          {!submitted ? (
            <form onSubmit={handleNotify} style={{ display: 'flex', gap: 8, maxWidth: 400, margin: '0 auto' }}>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder={c.emailPh}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 10, border: 'none', fontSize: 14, fontFamily: 'inherit' }} />
              <button type="submit" disabled={loading}
                style={{ padding: '12px 18px', background: '#a3e635', color: '#1a2e05', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {loading ? '...' : c.notify}
              </button>
            </form>
          ) : (
            <div style={{ background: '#1a2e05', border: '1px solid #a3e635', borderRadius: 12, padding: '14px 22px', color: '#a3e635', fontWeight: 700, fontSize: 14 }}>
              {c.noted}
            </div>
          )}
          <p style={{ fontSize: 11, color: '#444', marginTop: 10 }}>{c.noSpam}</p>
          {notifyError && <p style={{ fontSize: 12, color: '#fca5a5', marginTop: 8 }}>{notifyError}</p>}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 660, margin: '0 auto', padding: '56px 24px' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 28 }}>{c.faqTitle}</h2>
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
