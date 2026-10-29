import { useState } from 'react'
import type { Page } from '../App'
import { useCopy } from '../i18n'
import { HOW } from '../i18n/how'

interface Props {
  goToPage: (page: Page) => void
}

type Audience = 'guest' | 'host' | 'supplier'

export default function HowItWorksPage({ goToPage }: Props) {
  const [audience, setAudience] = useState<Audience>('guest')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const c = useCopy(HOW)
  const { guestSteps, hostSteps, supplierSteps, faqs } = c

  const currentSteps = audience === 'guest' ? guestSteps : audience === 'host' ? hostSteps : supplierSteps

  return (
    <div style={{ background: '#fff' }}>
      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)', padding: '60px 24px', textAlign: 'center', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#5aa800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.hero}</div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#2d2d2d', marginBottom: 16, lineHeight: 1.2 }}>
            {c.h1a} <span style={{ color: '#5aa800' }}>{c.h1b}</span>
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {c.lead}
          </p>
        </div>
      </section>

      {/* TABS */}
      <section style={{ padding: '40px 24px 0', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{c.whoTitle}</h2>
          <p style={{ fontSize: 14, color: '#6b7280' }}>{c.whoSub}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          {[
            { key: 'guest', label: c.tabs.guest },
            { key: 'host', label: c.tabs.host },
            { key: 'supplier', label: c.tabs.supplier },
          ].map(tab => (
            <button key={tab.key} onClick={() => setAudience(tab.key as Audience)}
              style={{ padding: '14px 24px', border: audience === tab.key ? '2px solid #a3e635' : '1.5px solid #e8e8e8', borderRadius: 12, background: audience === tab.key ? '#f0fdf4' : '#fff', color: audience === tab.key ? '#1a2e05' : '#2d2d2d', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section style={{ padding: '0 24px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: '#f9fafb', borderRadius: 20, padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
              {c.heads[audience]}
            </h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              {c.subs[audience]}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {currentSteps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: '#fff', padding: 20, borderRadius: 14, border: '1px solid #e8e8e8' }}>
                <div style={{ flexShrink: 0, width: 60, height: 60, background: '#f0fdf4', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {step.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#5aa800', background: '#f0fdf4', padding: '3px 10px', borderRadius: 100, letterSpacing: '0.05em' }}>
                      {c.stepLabel} {i + 1}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 5 }}>{step.title}</h4>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            {audience === 'guest' && (
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('events')}>
                {c.ctas.guest}
              </button>
            )}
            {audience === 'host' && (
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('signup')}>
                {c.ctas.host}
              </button>
            )}
            {audience === 'supplier' && (
              <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('signup')}>
                {c.ctas.supplier}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section style={{ padding: '60px 24px', background: '#fafafa', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>{c.whyTitle}</h2>
          <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 40 }}>{c.whySub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {c.why.map((item, i) => (
              <div key={i} style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h4>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>{c.faqTitle}</h2>
        <p style={{ fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 }}>{c.faqSub}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#2d2d2d', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span>{faq.q}</span>
                <span style={{ fontSize: 18, color: '#5aa800', flexShrink: 0 }}>{openFaq === i ? '−' : '+'}</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', fontSize: 14, color: '#6b7280', lineHeight: 1.7, borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '60px 24px', background: '#1a1a1a' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#a3e635', marginBottom: 16 }}>{c.readyTitle}</h2>
          <p style={{ fontSize: 15, color: '#aaa', marginBottom: 28, lineHeight: 1.7 }}>
            {c.readyLead}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => goToPage('listing')}>
              {c.findSpaces}
            </button>
            <button style={{ fontSize: 15, padding: '14px 28px', background: 'transparent', border: '2px solid #a3e635', borderRadius: 8, color: '#a3e635', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => goToPage('signup')}>
              {c.listSpace}
            </button>
            <button style={{ fontSize: 15, padding: '14px 28px', background: 'transparent', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => goToPage('signup')}>
              {c.imSupplier}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
