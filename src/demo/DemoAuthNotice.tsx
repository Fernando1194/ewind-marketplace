import { useState } from 'react'
import { supabase } from '../supabase'
import type { Page } from '../types'
import { DEMO_LOGIN } from './config'

// Shown on the login and sign-up pages of the demo: visitors use the shared demo
// account instead of creating one (the demo database is wiped every night, and its
// emails would not reach a real inbox anyway).
export default function DemoAuthNotice({ goToPage, compact }: { goToPage: (p: Page) => void; compact?: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const enter = async () => {
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword(DEMO_LOGIN)
    setBusy(false)
    if (error) { setError('Não foi possível entrar agora. Tente de novo em instantes.'); return }
    goToPage('events')
  }

  return (
    <div style={{ background: '#f7fee7', border: '1.5px solid #a3e635', borderRadius: 14, padding: compact ? 14 : 20, marginBottom: 20, textAlign: 'left' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2e05', marginBottom: 6 }}>Esta é a versão de demonstração</div>
      <p style={{ fontSize: 13, color: '#3f6212', marginBottom: 12, lineHeight: 1.5 }}>
        Não é preciso criar conta: entre como a Ana, uma organizadora fictícia que está planejando o casamento.
        Tudo o que você mudar volta ao original na próxima noite.
      </p>
      <button className="btn-primary" onClick={enter} disabled={busy} style={{ width: '100%', padding: 11, fontSize: 14 }}>
        {busy ? 'Entrando...' : 'Entrar como organizadora'}
      </button>
      {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 8 }}>{error}</p>}
      {!compact && (
        <p style={{ fontSize: 12, color: '#65a30d', marginTop: 10, marginBottom: 0 }}>
          Quer usar o Ewind de verdade? <a href="/cadastro" style={{ color: '#3f6212', fontWeight: 700 }}>Crie sua conta no site real</a>.
        </p>
      )}
    </div>
  )
}
