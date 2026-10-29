import { createClient } from '@supabase/supabase-js'
import { IS_DEMO } from './demo/config'

// The demo build talks to its own Supabase project (VITE_DEMO_* in .env.demo),
// never to the production database.
const supabaseUrl = IS_DEMO ? import.meta.env.VITE_DEMO_SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = IS_DEMO ? import.meta.env.VITE_DEMO_SUPABASE_KEY : import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
