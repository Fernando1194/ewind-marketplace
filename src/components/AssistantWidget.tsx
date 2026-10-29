import { useCopy } from '../i18n'
import { useState, useRef, useEffect } from 'react'

// Assistente do site. A conversa vive só na memória da página (nada é gravado no navegador)
// e é enviada a /api/assistant, que usa a IA da Anthropic. Ver api/assistant.ts.

type Msg = { role: 'user' | 'assistant'; content: string }

const MAX_TURNS = 8
const MAX_CHARS = 600

const COPY = {
  pt: {
    suggestions: ['Como me cadastro?', 'O que é o early adopter?', 'Anunciar custa quanto?', 'Meus dados ficam seguros?'],
    e429: 'Muitas perguntas por hoje. Tente de novo amanhã ou escreva para contato@ewind.com.br.',
    e400: 'Não consegui processar essa mensagem. Tente reescrever de forma mais curta.',
    down: 'O assistente está indisponível agora. Escreva para contato@ewind.com.br.',
    button: '💬 Dúvidas?', open: 'Abrir assistente', close: 'Fechar', name: 'Assistente Ewind',
    notice: 'Assistente com IA (Anthropic). Pode errar. Não envie dados pessoais.',
    hello: 'Oi! Posso tirar dúvidas sobre cadastro, planos e como usar o Ewind. O que você quer saber?',
    typing: 'Digitando...', ph: 'Digite sua dúvida', send: 'Enviar', human: 'Prefere falar com uma pessoa?',
  },
  en: {
    suggestions: ['How do I sign up?', 'What is the early adopter period?', 'How much does listing cost?', 'Is my data safe?'],
    e429: 'Too many questions for today. Try again tomorrow or write to contato@ewind.com.br.',
    e400: 'I could not process that message. Try rewording it more briefly.',
    down: 'The assistant is unavailable right now. Write to contato@ewind.com.br.',
    button: '💬 Questions?', open: 'Open assistant', close: 'Close', name: 'Ewind Assistant',
    notice: 'AI assistant (Anthropic). It can make mistakes. Do not send personal data.',
    hello: 'Hi! I can answer questions about signing up, plans and how to use Ewind. What would you like to know?',
    typing: 'Typing...', ph: 'Type your question', send: 'Send', human: 'Prefer to talk to a person?',
  },
}

export default function AssistantWidget() {
  const k = useCopy(COPY)
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
        setError(r.status === 429 ? k.e429 : r.status === 400 ? k.e400 : k.down)
        return
      }
      const data = await r.json() as { reply?: string }
      if (!data.reply) throw new Error('empty')
      setMsgs(m => [...m, { role: 'assistant', content: data.reply as string }])
    } catch {
      setError(k.down)
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label={k.open}
        style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 900, background: '#1a2e05', color: '#a3e635', border: '2px solid #a3e635', borderRadius: 100, padding: '12px 18px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 6px 20px rgba(0,0,0,.25)' }}>
        {k.button}
      </button>
    )
  }

  return (
    <div role="dialog" aria-label={k.name}
      style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 900, width: 'min(360px, calc(100vw - 32px))', height: 'min(520px, calc(100vh - 32px))', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: 'inherit' }}>
      <div style={{ background: '#1a2e05', color: '#fff', padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#a3e635' }}>{k.name}</div>
          <div style={{ fontSize: 11, color: '#cbd5b0' }}>{k.notice}</div>
        </div>
        <button onClick={() => setOpen(false)} aria-label={k.close} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, background: '#fafafa' }}>
        {msgs.length === 0 && (
          <>
            <div style={bubble('assistant')}>{k.hello}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {k.suggestions.map(s => (
                <button key={s} onClick={() => send(s)} style={{ fontSize: 12, padding: '6px 10px', borderRadius: 100, border: '1px solid #a3e635', background: '#f0fdf4', color: '#1a2e05', cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
              ))}
            </div>
          </>
        )}
        {msgs.map((m, i) => <div key={i} style={bubble(m.role)}>{m.content}</div>)}
        {loading && <div style={bubble('assistant')}>{k.typing}</div>}
        {error && <div style={{ fontSize: 12, color: '#b91c1c', background: '#fef2f2', borderRadius: 8, padding: 8 }}>{error}</div>}
        <div ref={endRef} />
      </div>

      <form onSubmit={e => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: 6, padding: 10, borderTop: '1px solid #e8e8e8', background: '#fff' }}>
        <input value={input} onChange={e => setInput(e.target.value)} maxLength={MAX_CHARS} placeholder={k.ph}
          style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e8e8e8', fontSize: 14, fontFamily: 'inherit' }} />
        <button type="submit" disabled={loading || !input.trim()}
          style={{ padding: '9px 14px', borderRadius: 8, border: 'none', background: '#a3e635', color: '#1a2e05', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', opacity: loading || !input.trim() ? 0.5 : 1 }}>{k.send}</button>
      </form>
      <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', padding: '0 10px 8px', background: '#fff' }}>
        {k.human} <a href="mailto:contato@ewind.com.br" style={{ color: '#4d7c0f' }}>contato@ewind.com.br</a>
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
