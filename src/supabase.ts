import { createClient } from '@supabase/supabase-js'
import { IS_DEMO, DEMO_SUPABASE } from './demo/config'

// Under /demo the app talks to the separate demo project, never to the production
// database, and keeps its session under a different key.
export const supabase = IS_DEMO
  ? createClient(DEMO_SUPABASE.url, DEMO_SUPABASE.key, { auth: { storageKey: DEMO_SUPABASE.storageKey } })
  : createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
