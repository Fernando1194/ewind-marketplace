// Demo build (`npm run build:demo`): a separate Supabase project filled with fictitious
// data, a fixed disclaimer banner and a guided tutorial. The regular build never sets
// VITE_DEMO, so none of this reaches production.

export const IS_DEMO = import.meta.env.VITE_DEMO === 'true'

// Shared demo account (organizer). The demo database is reset every night.
export const DEMO_LOGIN = { email: 'demo@ewind.com.br', password: 'ewind-demo' }

export const PRODUCTION_URL = 'https://ewind.com.br'
