import type { VercelRequest, VercelResponse } from '@vercel/node'

// Extrai dados e cláusulas de risco de um contrato de evento.
// NUNCA inventa valores: se não encontrar algo, retorna null naquele campo.
// O frontend exige revisão humana antes de salvar.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { contractText } = req.body
  if (!contractText || typeof contractText !== 'string' || contractText.trim().length < 40) {
    return res.status(400).json({ error: 'texto_insuficiente' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API não configurada' })

  // Limita o texto para controlar custo/latência (contratos longos)
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
}

O campo "confidence" reflete o quão legível e completo estava o contrato.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system,
        messages: [{ role: 'user', content: `Contrato:\n\n${text}` }],
      }),
    })

    if (!response.ok) throw new Error(`Anthropic ${response.status}`)
    const data = await response.json()
    let raw = (data.content?.[0]?.text || '').trim()

    // Remove cercas markdown se a IA incluir
    raw = raw.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(raw)
    } catch {
      // tenta achar o primeiro bloco { ... }
      const m = raw.match(/\{[\s\S]*\}/)
      if (!m) throw new Error('json_invalido')
      parsed = JSON.parse(m[0])
    }

    // Sanitiza: garante apenas as chaves esperadas
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

    return res.status(200).json({ fields: clean })
  } catch (err: any) {
    console.error('extract-contract error:', err?.message)
    return res.status(500).json({ error: 'falha_extracao' })
  }
}
