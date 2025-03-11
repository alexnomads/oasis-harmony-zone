
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Get the current site URL for redirects
const getSiteUrl = () => {
  let url = window.location.origin
  // Handle local development with specific ports if needed
  if (url.includes('localhost')) {
    // You can set a specific port if needed, e.g., 'http://localhost:5173'
    return url
  }
  return url
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: `${getSiteUrl()}/auth/callback`
  },
  global: {
    headers: {
      'x-application-name': 'rose-of-jericho'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Auth helper functions with improved error handling
