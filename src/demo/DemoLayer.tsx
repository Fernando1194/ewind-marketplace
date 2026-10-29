import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../supabase'
import type { Page } from '../types'
import { DEMO_LOGIN, PRODUCTION_URL } from './config'
import { TOURS, type Tour, type TourStep } from './tours'

// Demo-only UI: the disclaimer banner, the tutorial menu, the first-visit invitation
// and the guided tour itself (highlight + step card).

interface Props {
  user: User | null
  goToPage: (p: Page) => void
}

const SEEN_KEY = 'ewind_demo_welcome_seen'
const readSeen = () => { try { return localStorage.getItem(SEEN_KEY) === '1' } catch { return true } }
const markSeen = () => { try { localStorage.setItem(SEEN_KEY, '1') } catch { /* private mode */ } }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function waitFor(selector: string, timeout = 6000): Promise<HTMLElement | null> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    // first visible match, so a selector list can name a desktop and a mobile element
    const el = [...document.querySelectorAll<HTMLElement>(selector)].find(e => e.getClientRects().length > 0)
    if (el) return el
    await sleep(100)
  }
  return null
}

export default function DemoLayer({ user, goToPage }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [welcome, setWelcome] = useState(() => !readSeen())
  const [tour, setTour] = useState<Tour | null>(null)
  const [index, setIndex] = useState(0)
  const [loggingIn, setLoggingIn] = useState(false)

  // keep the latest user for the async step runner
  const userRef = useRef(user)
  useEffect(() => { userRef.current = user }, [user])

  useEffect(() => {
    // the demo should not compete with the real site in search engines
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.head.removeChild(meta) }
  }, [])

  const login = useCallback(async () => {
    if (userRef.current) return true
    setLoggingIn(true)
    const { error } = await supabase.auth.signInWithPassword(DEMO_LOGIN)
    if (!error) {
      for (let i = 0; i < 50 && !userRef.current; i++) await sleep(100)
    }
    setLoggingIn(false)
    if (error) alert('Não foi possível entrar na conta de demonstração agora. Tente de novo em instantes.')
    return !error
  }, [])

  const start = (t: Tour) => {
    markSeen(); setWelcome(false); setMenuOpen(false)
    setIndex(0); setTour(t)
  }

  return (
    <>
      <div style={{ background: '#1a2e05', color: '#ecfccb', fontSize: 13, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1001 }}>
        <span>
          <strong style={{ color: '#a3e635' }}>Versão de demonstração.</strong>{' '}
          Pessoas, empresas e eventos são fictícios e voltam ao original toda noite.
        </span>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setMenuOpen(v => !v)} style={bannerBtn(true)}>▶ Tutorial</button>
          {!user && (
            <button onClick={login} disabled={loggingIn} style={bannerBtn(false)}>
              {loggingIn ? 'Entrando...' : 'Entrar como organizadora'}
            </button>
          )}
          <a href={PRODUCTION_URL} style={{ ...bannerBtn(false), textDecoration: 'none' }}>Ir para o Ewind real</a>
        </span>

        {menuOpen && (
          <div role="menu" style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6, width: 'min(380px, calc(100vw - 32px))', background: '#fff', color: '#1a1a1a', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.25)', padding: 10 }}>
            {TOURS.map(t => (
              <button key={t.id} onClick={() => start(t)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 14px', border: 'none', background: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f7fee7')} onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{t.description} · {t.steps.length} passos</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {welcome && !tour && (
        <Modal onClose={() => { markSeen(); setWelcome(false) }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>👋</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Bem-vindo à demonstração do Ewind</h2>
          <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 6 }}>
            Esta é uma cópia do Ewind com dados fictícios, para você explorar sem cadastro. Tudo o que você mudar volta ao original na próxima noite.
          </p>
          <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 18 }}>Quer um passo a passo guiado?</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TOURS.map((t, i) => (
              <button key={t.id} className={i === 0 ? 'btn-primary' : undefined} onClick={() => start(t)}
                style={i === 0 ? { padding: 12, fontSize: 14 } : { padding: 12, fontSize: 14, fontWeight: 600, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.title}
              </button>
            ))}
            <button onClick={() => { markSeen(); setWelcome(false) }} style={{ padding: 8, fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              Explorar sozinho
            </button>
          </div>
        </Modal>
      )}

      {tour && (
        <TourRunner
          tour={tour}
          index={index}
          setIndex={setIndex}
          close={() => setTour(null)}
          goToPage={goToPage}
          login={login}
        />
      )}
    </>
  )
}

function bannerBtn(primary: boolean): React.CSSProperties {
  return {
    fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 100, cursor: 'pointer', fontFamily: 'inherit',
    border: primary ? 'none' : '1px solid rgba(236,252,203,0.4)',
    background: primary ? '#a3e635' : 'transparent', color: primary ? '#1a2e05' : '#ecfccb',
  }
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, padding: 26, maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        {children}
      </div>
    </div>
  )
}

interface RunnerProps {
  tour: Tour
  index: number
  setIndex: (i: number) => void
  close: () => void
  goToPage: (p: Page) => void
  login: () => Promise<boolean>
}

function TourRunner({ tour, index, setIndex, close, goToPage, login }: RunnerProps) {
  const step: TourStep = tour.steps[index]
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [trackedRect, setRect] = useState<DOMRect | null>(null)
  // the step whose preparation finished; until it equals `index` the card says "Carregando..."
  const [readyIndex, setReadyIndex] = useState(-1)
  const preparing = readyIndex !== index
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardH, setCardH] = useState(180)

  // run the step's preparation, then find the element to highlight
  useEffect(() => {
    let cancelled = false
    const prepare = async () => {
      setTarget(null); setRect(null)
      if (step.login && !(await login())) { if (!cancelled) close(); return }
      if (step.go) { goToPage(step.go); await sleep(250) }
      const clicks = step.click ? ([] as string[]).concat(step.click) : []
      for (let i = 0; i < clicks.length && !cancelled; i++) {
        if (i === clicks.length - 1 && step.skipClickIf && document.querySelector(step.skipClickIf)) break
        const el = await waitFor(clicks[i])
        if (el) { el.click(); await sleep(300) }
      }
      const el = step.target ? await waitFor(step.target) : null
      if (cancelled) return
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        await sleep(350)
      }
      if (!cancelled) { setTarget(el); setReadyIndex(index) }
    }
    prepare().catch(err => {
      // never leave the card stuck on "Carregando...": show the step without highlight
      console.error('[tour] step', index + 1, err)
      if (!cancelled) { setTarget(null); setReadyIndex(index) }
    })
    return () => { cancelled = true }
  }, [tour.id, index]) // eslint-disable-line react-hooks/exhaustive-deps

  // follow the element while the page scrolls or resizes
  useEffect(() => {
    if (!target) return
    let raf = 0
    const tick = () => {
      if (!target.isConnected) { setRect(null); return }
      const r = target.getBoundingClientRect()
      setRect(prev => prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height ? prev : r)
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [target])

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight)
  })

  // the cookie banner would cover highlighted elements at the bottom of the screen
  useEffect(() => {
    document.body.dataset.tour = 'on'
    return () => { delete document.body.dataset.tour }
  }, [])

  const last = index === tour.steps.length - 1
  const next = useCallback(() => { if (last) close(); else setIndex(index + 1) }, [last, index, close, setIndex])
  const prev = useCallback(() => { if (index > 0) setIndex(index - 1) }, [index, setIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight' && !preparing) next()
      else if (e.key === 'ArrowLeft' && !preparing) prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, close, preparing])

  // a frame from the previous step's element must never outlive it
  const rect = target && !preparing ? trackedRect : null

  // card position: below the element when it fits, otherwise above; centered without element
  const pad = 8
  const vw = window.innerWidth, vh = window.innerHeight
  const cardW = Math.min(360, vw - 32)
  let cardStyle: React.CSSProperties
  if (rect) {
    const below = rect.bottom + pad + 12
    const above = rect.top - pad - 12 - cardH
    // below if it fits, else above if it fits, else pinned to the bottom of the screen
    const top = below + cardH < vh - 8 ? below : above >= 8 ? above : Math.max(8, vh - cardH - 8)
    const left = Math.min(Math.max(16, rect.left + rect.width / 2 - cardW / 2), vw - cardW - 16)
    cardStyle = { top, left, width: cardW }
  } else {
    cardStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: cardW }
  }

  return (
    <div aria-live="polite" style={{ position: 'fixed', inset: 0, zIndex: 20000 }}>
      <style>{'body[data-tour="on"] [data-cookie-banner] { display: none !important; }'}</style>
      {/* blocks clicks on the page while the tour runs */}
      <div style={{ position: 'absolute', inset: 0, background: rect ? 'transparent' : 'rgba(0,0,0,0.5)' }} />
      {rect && (
        <div style={{
          position: 'fixed', top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2,
          borderRadius: 12, boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', outline: '3px solid #a3e635', pointerEvents: 'none',
          transition: 'top .2s, left .2s, width .2s, height .2s',
        }} />
      )}

      <div ref={cardRef} role="dialog" aria-label={step.title} style={{ position: 'fixed', ...cardStyle, background: '#fff', borderRadius: 16, padding: 18, boxShadow: '0 16px 50px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#5aa800', letterSpacing: 0.4, textTransform: 'uppercase' }}>
            {tour.title} · {index + 1}/{tour.steps.length}
          </span>
          <button onClick={close} aria-label="Fechar tutorial" style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ height: 4, background: '#f3f4f6', borderRadius: 4, marginBottom: 12 }}>
          <div style={{ height: 4, width: `${((index + 1) / tour.steps.length) * 100}%`, background: '#a3e635', borderRadius: 4, transition: 'width .2s' }} />
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6, color: '#1a1a1a' }}>{step.title}</h3>
        <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#4b5563', marginBottom: 14 }}>
          {preparing ? 'Carregando...' : step.body}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <button onClick={prev} disabled={index === 0 || preparing} style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, background: '#f3f4f6', border: 'none', borderRadius: 8, cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.4 : 1, fontFamily: 'inherit' }}>
            ← Voltar
          </button>
          <button className="btn-primary" onClick={next} disabled={preparing} style={{ padding: '8px 18px', fontSize: 13 }}>
            {last ? 'Concluir' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  )
}
