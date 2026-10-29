import { useEffect, useState } from 'react'
import { useLang } from '../i18n'

// Aviso único (por navegador) ao usar o site em inglês: o conteúdo escrito pelos anunciantes
// continua no idioma em que foi digitado, e os Termos/Privacidade existem só em português.
const KEY = 'ewind-en-notice'

const seen = (): boolean => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }

export default function LangNotice() {
  const { lang } = useLang()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(lang === 'en' && !seen()) }, [lang])

  const close = () => {
    setOpen(false)
    try { localStorage.setItem(KEY, '1') } catch { /* sem armazenamento: o aviso volta na próxima visita */ }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null
  return (
    <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-labelledby="lang-notice-title" onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 16, maxWidth: 440, width: '100%', padding: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div id="lang-notice-title" style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: '#2d2d2d' }}>🌐 A note about languages</div>
        <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: '0 0 10px' }}>
          The Ewind interface is available in English. Ewind is launching in Curitiba, Brazil, so some content is still in Portuguese:
        </p>
        <ul style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: '0 0 16px', paddingLeft: 20 }}>
          <li>Listing names, descriptions and messages are written by Brazilian hosts and suppliers, and are not translated.</li>
          <li>The Terms of Use and Privacy Policy are available only in Portuguese.</li>
        </ul>
        <button onClick={close} className="btn-primary" style={{ width: '100%', padding: 12, fontSize: 14 }} autoFocus>Got it</button>
      </div>
    </div>
  )
}
