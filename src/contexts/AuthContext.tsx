
import { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase, getRedirectUrl } from '@/lib/supabase';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Handle auth errors with appropriate messages
const handleAuthError = (error: Error | AuthError | null) => {
  if (!error) return 'An unknown error occurred';
  
  // Handle network errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Handle Supabase auth errors
  if (error instanceof AuthError) {
    switch (error.status) {
      case 400:
        return 'Invalid email or password';
      case 401:
        return 'Invalid credentials';
      case 422:
        return 'Email or password is invalid';
      case 429:
        return 'Too many attempts, please try again later';
      default:
        return error.message;
    }
  }
  
  return error.message;
};

const retryOperation = async <T,>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && error instanceof Error && 
       (error.message.includes('fetch') || error.message.includes('network'))) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Get initial session with retry logic
    const initSession = async () => {
      try {
        const { data: { session }, error } = await retryOperation(() =>
          supabase.auth.getSession()
        );

        if (error) throw error;
        if (!mounted) return;

        setState(prev => ({
          ...prev,
          user: session?.user ?? null,
          loading: false,
          error: null,
        }));
      } catch (error) {
        if (!mounted) return;
        console.error('Session initialization error:', error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: handleAuthError(error as Error | AuthError),
        }));
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
        error: null,
      }));
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await retryOperation(() =>
        supabase.auth.signInWithPassword({ email, password })
      );
      
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (error) {
      const message = handleAuthError(error as Error | AuthError);
      setState(prev => ({ ...prev, error: message }));
      toast({
        title: 'Sign In Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const redirectUrl = getRedirectUrl();
      console.log('Using redirect URL for signup:', redirectUrl);
      
      const { error } = await retryOperation(() =>
        supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: redirectUrl,
          },
        })
      );
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Please check your email to verify your account.',
      });
    } catch (error) {
      const message = handleAuthError(error as Error | AuthError);
      setState(prev => ({ ...prev, error: message }));
      toast({
        title: 'Sign Up Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await retryOperation(() => supabase.auth.signOut());
      
      if (error) throw error;
      
      navigate('/');
    } catch (error) {
      const message = handleAuthError(error as Error | AuthError);
      setState(prev => ({ ...prev, error: message }));
      toast({
        title: 'Sign Out Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
