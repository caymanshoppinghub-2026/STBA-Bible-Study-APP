import { createClient } from '@supabase/supabase-js'

const rawUrl = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_URL || process.env?.SUPABASE_URL)) ||
  "https://ygsatsfcvodstgjhmths.supabase.co"

// Clean up standard trailing REST API routes so supabase-js SDK resolves correctly
const cleanedUrl = String(rawUrl).replace(/\/rest\/v1\/?$/, '').trim()

const SUPABASE_ANON_KEY = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && (process.env?.VITE_SUPABASE_ANON_KEY || process.env?.SUPABASE_ANON_KEY)) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlnc2F0c2Zjdm9kc3RnamhtdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0ODQxNzUsImV4cCI6MjA5NzA2MDE3NX0.Tc4-IvWSmqADtYd2E5_ja3s3V4-lQ9NU51mjST1sbEU"

export const supabase = createClient(cleanedUrl, String(SUPABASE_ANON_KEY).trim(), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
})

