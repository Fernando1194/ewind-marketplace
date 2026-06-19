import type { VercelRequest, VercelResponse } from '@vercel/node'

// Extrai dados e cláusulas de risco de um contrato de evento.
// NUNCA inventa valores: se não encontrar algo, retorna null naquele campo.
// O frontend exige revisão humana antes de salvar.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // req.body pode vir como objeto (Vercel parseia) ou string (dependendo do content-type)
  let body: any = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const contractText = body?.contractText

  if (!contractText || typeof contractText !== 'string' || contractText.trim().length < 40) {
    return res.status(400).json({ error: 'texto_insuficiente', detail: `recebido ${typeof contractText}, tamanho ${contractText?.length || 0}` })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'api_nao_configurada', detail: 'ANTHROPIC_API_KEY ausente no ambiente' })

  const text = contractText.slice(0, 18000)

  const system = `Você extrai informações de contratos de prestação de serviço para eventos (buffet, espaço, fotografia, etc.) no Brasil.

REGRAS ABSOLUTAS:
- Extraia APENAS o que está explícito no texto. NUNCA invente, estime ou deduza valores.
- Se uma informação não estiver clara ou não existir, retorne null naquele campo.
- Valores monetários: retorne só o número (ex: 12000.50), sem "R$" nem pontos de milhar.
- Datas: formato ISO YYYY-MM-DD. Se ambígua ou ausente, null.
- Para cláusulas: copie o trecho relevante de forma resumida e fiel, sem parafrasear o sentido.

Responda SOMENTE com um objeto JSON válido, sem markdown, sem explicação, neste formato exato:
{
  "supplier_name": string | null,
  "category": string | null,
  "total_value": number | null,
  "service_date": string | null,
  "contact_phone": string | null,
  "penalty_clause": string | null,
  "cancellation_policy": string | null,
  "special_clauses": string | null,
  "confidence": "alta" | "media" | "baixa"
}`

  // Tenta uma lista de modelos em ordem; usa o primeiro que responder.
  const models = ['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-8']

  let lastError = ''
  for (const model of models) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system,
          messages: [{ role: 'user', content: `Contrato:\n\n${text}` }],
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        lastError = `modelo ${model}: HTTP ${response.status} — ${errText.slice(0, 200)}`
        // 404 = modelo inexistente: tenta o próximo. Outros erros: também tenta próximo.
        continue
      }

      const data = await response.json()
      let raw = (data.content?.[0]?.text || '').trim()
      raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim()

      let parsed: any
      try {
        parsed = JSON.parse(raw)
      } catch {
        const m = raw.match(/\{[\s\S]*\}/)
        if (!m) { lastError = `modelo ${model}: resposta não-JSON`; continue }
        parsed = JSON.parse(m[0])
      }

      const clean = {
        supplier_name: parsed.supplier_name ?? null,
        category: parsed.category ?? null,
        total_value: typeof parsed.total_value === 'number' ? parsed.total_value : null,
        service_date: parsed.service_date ?? null,
        contact_phone: parsed.contact_phone ?? null,
        penalty_clause: parsed.penalty_clause ?? null,
        cancellation_policy: parsed.cancellation_policy ?? null,
        special_clauses: parsed.special_clauses ?? null,
        confidence: ['alta', 'media', 'baixa'].includes(parsed.confidence) ? parsed.confidence : 'baixa',
      }

      return res.status(200).json({ fields: clean, model_used: model })
    } catch (err: any) {
      lastError = `modelo ${model}: ${err?.message || 'erro desconhecido'}`
      continue
    }
  }

  // Se chegou aqui, todos os modelos falharam — devolve o motivo real
  return res.status(500).json({ error: 'falha_extracao', detail: lastError })
}
