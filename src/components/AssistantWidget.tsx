import { useState, useRef, useEffect } from 'react'

// Assistente do site. A conversa vive só na memória da página (nada é gravado no navegador)
// e é enviada a /api/assistant, que usa a IA da Anthropic. Ver api/assistant.ts.

type Msg = { role: 'user' | 'assistant'; content: string }

const MAX_TURNS = 8
const MAX_CHARS = 600

const SUGGESTIONS = [
  'Como me cadastro?',
  'O que é o early adopter?',
  'Anunciar custa quanto?',
  'Meus dados ficam seguros?',
]

const ERRORS: Record<number, string> = {
  429: 'Muitas perguntas por hoje. Tente de novo amanhã ou escreva para contato@ewind.com.br.',
  400: 'Não consegui processar essa mensagem. Tente reescrever de forma mais curta.',
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }) }, [msgs, loading, open])

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, MAX_CHARS)
    if (!text || loading) return
    setError('')
    const next: Msg[] = [...msgs, { role: 'user', content: text }]
    setMsgs(next)
    setInput('')
    setLoading(true)
    // envia só o final da conversa, sempre começando por uma mensagem do usuário
    let window = next.slice(-MAX_TURNS)
    while (window.length && window[0].role !== 'user') window = window.slice(1)
    try {
      const r = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: window }),
      })
      if (!r.ok) {
        setError(ERRORS[r.status] || 'O assistente está indisponível agora. Escreva para contato@ewind.com.br.')
        return
      }
      const data = await r.json() as { reply?: string }
      if (!data.reply) throw new Error('empty')
      setMsgs(m => [...m, { role: 'assistant', content: data.reply as string }])
    } catch {
      setError('O assistente está indisponível agora. Escreva para contato@ewind.com.br.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label="Abrir assistente"
        style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 900, background: '#1a2e05', color: '#a3e635', border: '2px solid #a3e635', borderRadius: 100, padding: '12px 18px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(0,0,0,.25)' }}>
        💬 Dúvidas?
      </button>
    )
  }

  return (
    <div role="dialog" aria-label="Assistente Ewind"
      style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 900, width: 'min(360px, calc(100vw - 32px))', height: 'min(520px, calc(100vh - 32px))', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'inherit' }}>
      <div style={{ background: '#1a2e05', color: '#fff', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#a3e635' }}>Assistente Ewind</div>
          <div style={{ fontSize: 11, color: '#cbd5b0' }}>Assistente com IA (Anthropic). Pode errar. Não envie dados pessoais.</div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Fechar" style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: '#fafafa' }}>
        {msgs.length === 0 && (
          <>
            <div style={bubble('assistant')}>Oi! Posso tirar dúvidas sobre cadastro, planos e como usar o Ewind. O que você quer saber?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 100, border: '1px solid #a3e635', background: '#f0fdf4', color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
              ))}
            </div>
          </>
        )}
        {msgs.map((m, i) => <div key={i} style={bubble(m.role)}>{m.content}</div>)}
        {loading && <div style={bubble('assistant')}>Digitando...</div>}
        {error && <div style={{ fontSize: 12, color: '#b91c1c', background: '#fef2f2', borderRadius: 8, padding: 8 }}>{error}</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={e => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid #e8e8e8', background: '#fff' }}>
        <input value={input} onChange={e => setInput(e.target.value)} maxLength={MAX_CHARS} placeholder="Digite sua dúvida"
          style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e8e8e8', fontSize: 14, fontFamily: 'inherit' }} />
        <button type="submit" disabled={loading || !input.trim()}
          style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: '#a3e635', color: '#1a2e05', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: loading || !input.trim() ? 0.5 : 1 }}>Enviar</button>
      </form>
      <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', padding: '0 10px 8px', background: '#fff' }}>
        Prefere falar com uma pessoa? <a href="mailto:contato@ewind.com.br" style={{ color: '#4d7c0f' }}>contato@ewind.com.br</a>
      </div>
    </div>
  )
}

function bubble(role: Msg['role']): React.CSSProperties {
  const user = role === 'user'
  return {
    alignSelf: user ? 'flex-end' : 'flex-start', maxWidth: '88%', padding: '8px 12px', borderRadius: 12,
    background: user ? '#a3e635' : '#fff', color: user ? '#1a2e05' : '#2d2d2d',
    border: user ? 'none' : '1px solid #e8e8e8', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap',
  }
}
