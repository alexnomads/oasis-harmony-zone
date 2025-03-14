
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Get the current site URL for redirects, handling both local and production environments
const getSiteUrl = () => {
  // For deployed Lovable apps
  if (window.location.hostname.includes('lovable.app')) {
    return window.location.origin
  }
  // For local development
  return 'http://localhost:5173'
}

// Set up redirect URL for authentication
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
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = getRedirectUrl();
    console.log('Using redirect URL for Google sign-in:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    return { data, error };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return { data: null, error };
  }
};

