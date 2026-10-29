import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
import { SYSTEM_PROMPT } from './_assistantKnowledge'

// Assistente do site. Endpoint público, por isso fechado de propósito:
// - sem ferramentas, sem acesso a banco ou a dados de usuários;
// - entrada validada (poucos turnos, tamanho máximo);
// - limite por visitante e teto global por dia (função assistant_hit no banco);
//   se o limite não puder ser verificado, a resposta é negada (fail-closed);
// - o conteúdo da conversa não é gravado nem registrado em log.

const MAX_TURNS = 8
const MAX_CHARS = 600
const MODEL = process.env.ASSISTANT_MODEL || 'claude-haiku-4-5'
const IP_LIMIT = Number(process.env.ASSISTANT_IP_LIMIT) || 20
const GLOBAL_LIMIT = Number(process.env.ASSISTANT_GLOBAL_LIMIT) || 300

type Msg = { role: 'user' | 'assistant'; content: string }

function parseMessages(body: unknown): Msg[] | null {
  const raw = (body as { messages?: unknown } | null)?.messages
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_TURNS) return null
  const out: Msg[] = []
  for (const m of raw) {
    if (!m || typeof m !== 'object') return null
    const { role, content } = m as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') return null
    if (typeof content !== 'string') return null
    const text = content.trim()
    if (!text || text.length > MAX_CHARS) return null
    out.push({ role, content: text })
  }
  if (out[0].role !== 'user' || out[out.length - 1].role !== 'user') return null
  for (let i = 1; i < out.length; i++) if (out[i].role === out[i - 1].role) return null
  return out
}

function visitorKey(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for']
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0].trim() || String(req.headers['x-real-ip'] || 'unknown')
  const day = new Date().toISOString().slice(0, 10)
  const salt = process.env.ASSISTANT_SALT || 'ewind'
  return createHash('sha256').update(`${ip}|${day}|${salt}`).digest('hex')
}

// true = pode responder. Qualquer falha vira false.
async function allowed(key: string): Promise<boolean> {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !anon) return false
  try {
    const r = await fetch(`${url}/rest/v1/rpc/assistant_hit`, {
      method: 'POST',
      headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_key: key, p_ip_limit: IP_LIMIT, p_global_limit: GLOBAL_LIMIT }),
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return false
    return (await r.json()) === true
  } catch {
    return false
  }
}

function clean(text: string): string {
  return text.replace(/\s*[—–]\s*/g, ', ').replace(/,\s*,/g, ',').trim().slice(0, 1200)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })

  // aceita só chamadas vindas do próprio site (barreira simples contra uso por outros sites)
  const origin = req.headers.origin
  if (origin) {
    let host = ''
    try { host = new URL(origin).host } catch { /* origem inválida */ }
    if (host !== req.headers.host) return res.status(403).json({ error: 'forbidden' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'unavailable' })

  const messages = parseMessages(req.body)
  if (!messages) return res.status(400).json({ error: 'invalid_input' })

  if (!(await allowed(visitorKey(req)))) return res.status(429).json({ error: 'limit' })

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: MODEL, max_tokens: 400, system: SYSTEM_PROMPT, messages }),
      signal: AbortSignal.timeout(15000),
    })
    if (!r.ok) return res.status(502).json({ error: 'upstream' })
    const data = (await r.json()) as { content?: { type: string; text?: string }[] }
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text || '').join('').trim()
    if (!text) return res.status(502).json({ error: 'upstream' })
    return res.status(200).json({ reply: clean(text) })
  } catch {
    return res.status(502).json({ error: 'upstream' })
  }
}
