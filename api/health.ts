import type { VercelRequest, VercelResponse } from '@vercel/node'

// Keepalive do Supabase.
//
// O plano gratuito pausa o projeto após ~7 dias sem atividade, e com o banco pausado
// cadastro e login falham. O cron diário definido em vercel.json chama este endpoint,
// que faz uma leitura mínima e pública (a mesma que qualquer visitante faz na listagem),
// mantendo o projeto ativo. Não escreve nada e não devolve dados do banco.

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    return res.status(500).json({ ok: false, error: 'supabase_nao_configurado' })
  }

  try {
    const r = await fetch(`${url}/rest/v1/spaces?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    // 200 = banco respondeu. Qualquer outro status vira 503 para aparecer nos logs do cron.
    return res.status(r.ok ? 200 : 503).json({ ok: r.ok, supabase_status: r.status })
  } catch {
    return res.status(503).json({ ok: false, error: 'supabase_inacessivel' })
  }
}
