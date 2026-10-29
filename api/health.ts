import type { VercelRequest, VercelResponse } from '@vercel/node'

// Supabase keepalive.
//
// The free plan pauses a project after about 7 days without activity; while paused,
// sign-up and login fail (this happened to production on 2026-10-28). The daily cron in
// vercel.json calls this endpoint, which makes one minimal public read on each project:
// production, and the demo served at /demo (otherwise a week without visitors would
// pause the demo). It writes nothing and returns no data from either database.

// The demo project's public client values (same as src/demo/config.ts).
const DEMO = { url: 'https://qydqnoyhpkhzozlbtvdx.supabase.co', key: 'sb_publishable_gF4-r9xZKYOTUBeRv5tPJw_1B0oFGFp' }

async function ping(url: string | undefined, key: string | undefined) {
  if (!url || !key) return { ok: false, error: 'not_configured' }
  try {
    const r = await fetch(`${url}/rest/v1/spaces?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    return { ok: r.ok, status: r.status }
  } catch {
    return { ok: false, error: 'unreachable' }
  }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const [production, demo] = await Promise.all([
    ping(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    ping(DEMO.url, DEMO.key),
  ])
  // 503 when either database did not answer, so it stands out in the cron logs
  return res.status(production.ok && demo.ok ? 200 : 503).json({ production, demo })
}
