import type { Page } from '../App'
import { useCopy } from '../i18n'
import { ABOUT } from '../i18n/about'

interface Props {
  goToPage: (page: Page) => void
}

export default function AboutPage({ goToPage }: Props) {
  const c = useCopy(ABOUT)
  const { values, stats } = c
  const actions: Page[] = ['listing', 'signup', 'signup']

  return (
    <div style={{ background: '#fff' }}>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#a3e635', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{c.hero}</div>
          <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            {c.h1a}{' '}
            <span style={{ color: '#a3e635' }}>{c.h1b}</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 580, margin: '0 auto 32px' }}>
            {c.lead}
          </p>
          <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={() => goToPage('events')}>
            {c.cta}
          </button>
        </div>
      </section>

      {/* MISSÃO */}
      <section style={{ padding: '72px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{c.mission}</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.25, marginBottom: 20, color: '#2d2d2d' }}>
              {c.missionTitle}
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 16 }}>
              {c.m1}
            </p>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, marginBottom: 16 }}>
              {c.m2}
            </p>
            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8 }}>
              {c.m3}
            </p>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfccb 100%)', borderRadius: 20, padding: 40, border: '1px solid #d9f99d' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎯</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 14, color: '#1a2e05' }}>{c.purpose}</h3>
            <p style={{ fontSize: 15, color: '#365314', lineHeight: 1.7, fontStyle: 'italic' }}>
              {c.quote}
            </p>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#5aa800' }}>Fernando Vieira</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{c.founderRole}</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{c.why}</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 16, color: '#2d2d2d' }}>
            {c.whyTitle}
          </h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 680, margin: '0 auto 48px' }}>
            {c.whyP}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, textAlign: 'left' }}>
            <div style={{ background: '#fff', padding: 28, borderRadius: 14, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>😓</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{c.before}</h4>
              <ul style={{ fontSize: 13, color: '#6b7280', lineHeight: 2, paddingLeft: 18 }}>
                {c.beforeList.map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>
            <div style={{ background: '#f0fdf4', padding: 28, borderRadius: 14, border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🎉</div>
              <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, color: '#1a2e05' }}>{c.after}</h4>
              <ul style={{ fontSize: 13, color: '#166534', lineHeight: 2, paddingLeft: 18 }}>
                {c.afterList.map(t => <li key={t}>{t}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section style={{ padding: '72px 24px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{c.numbers}</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 40, color: '#2d2d2d' }}>{c.numbersTitle}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: '#f9fafb', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#a3e635', marginBottom: 8 }}>{s.number}</div>
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VALORES */}
      <section style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{c.valuesLabel}</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2d2d2d' }}>{c.valuesTitle}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: '#fff', padding: 28, borderRadius: 14, border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{v.icon}</div>
                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>{v.title}</h4>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNDADOR */}
      <section style={{ padding: '72px 24px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{c.behind}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#2d2d2d' }}>{c.team}</h2>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ background: '#fff', border: '1.5px solid #e8e8e8', borderRadius: 16, padding: 36, maxWidth: 440, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #a3e635, #5aa800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px' }}>👨‍💼</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Fernando Vieira</h3>
            <div style={{ fontSize: 13, color: '#5aa800', fontWeight: 600, marginBottom: 4 }}>{c.founderTitle}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>📍 Curitiba, PR</div>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
              {c.founderBio}
            </p>
          </div>
        </div>
      </section>

      {/* PARA TODOS */}
      <section style={{ background: '#f9fafb', padding: '72px 24px', borderTop: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#5aa800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{c.forAll}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 16, color: '#2d2d2d' }}>{c.forAllTitle}</h2>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.8, maxWidth: 640, margin: '0 auto 48px' }}>
            {c.forAllP}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {c.cards.map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 28, border: '1px solid #e8e8e8', textAlign: 'left' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{card.icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{card.title}</h4>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>{card.desc}</p>
                <button onClick={() => goToPage(actions[i])} style={{ fontSize: 12, fontWeight: 700, color: '#5aa800', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                  {card.btn}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ padding: '72px 24px', background: '#1a1a1a' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎊</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#a3e635', marginBottom: 16, lineHeight: 1.3 }}>
            {c.ctaTitle}
          </h2>
          <p style={{ fontSize: 15, color: '#9ca3af', marginBottom: 32, lineHeight: 1.7 }}>
            {c.ctaP}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }} onClick={() => goToPage('listing')}>
              {c.findMine}
            </button>
            <button style={{ fontSize: 15, padding: '14px 28px', background: 'transparent', border: '2px solid #a3e635', borderRadius: 8, color: '#a3e635', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => goToPage('how-it-works')}>
              {c.how}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
