
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kesejxmbfvpkgnwofiys.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlc2VqeG1iZnZwa2dud29maXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNzM0NjIsImV4cCI6MjA1NDg0OTQ2Mn0.uhIvHz-e0hDXH71YdPXlFlDK-aBCyjbttNi4qMy_PwE"

// Get the current site URL for redirects, handling both local and production environments
export const getSiteUrl = () => {
  // For local development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5173'
  }
  // For all deployed environments (lovable.app, custom domains, etc.)
  return window.location.origin
}

// Set up redirect URL for authentication callback
export const getRedirectUrl = () => {
  return `${getSiteUrl()}/auth/callback`;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
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
export const signInWithPassword = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
}

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({
    email, 
    password,
    options: {
      emailRedirectTo: getRedirectUrl(),
    }
  });
}

export const signOut = async () => {
  return await supabase.auth.signOut();
}

export const getSession = async () => {
  return await supabase.auth.getSession();
}

export const refreshSession = async () => {
  return await supabase.auth.refreshSession();
}
