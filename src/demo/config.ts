// Demo mode: the same app served under /demo (ewind.com.br/demo), running against a
// separate Supabase project filled with fictitious data, with a disclaimer banner and a
// guided tutorial. Everything outside /demo is the real site and never loads src/demo/.

const DEMO_PREFIX = '/demo'

const path = typeof window !== 'undefined' ? window.location.pathname : '/'
export const IS_DEMO =
  path === DEMO_PREFIX || path.startsWith(DEMO_PREFIX + '/')

// Prefix for every URL the app builds while in demo mode ('' on the real site).
export const BASE_PATH = IS_DEMO ? DEMO_PREFIX : ''

// Path without the demo prefix, so the router sees the same paths in both modes.
export const stripBase = (p: string) => (BASE_PATH && p.startsWith(BASE_PATH) ? p.slice(BASE_PATH.length) || '/' : p)

// Demo Supabase project. Public client values (the publishable key only grants what
// Row Level Security allows), so they live in the code rather than in Vercel settings.
export const DEMO_SUPABASE = {
  url: 'https://qydqnoyhpkhzozlbtvdx.supabase.co',
  key: 'sb_publishable_gF4-r9xZKYOTUBeRv5tPJw_1B0oFGFp',
  // its own storage key, so a demo session never replaces a real one in the same browser
  storageKey: 'ewind-demo-auth',
}

// Shared demo account (organizer). The demo database is reset every night.
export const DEMO_LOGIN = { email: 'demo@ewind.com.br', password: 'ewind-demo' }

export const DEMO_URL = DEMO_PREFIX
export const PRODUCTION_URL = '/'
