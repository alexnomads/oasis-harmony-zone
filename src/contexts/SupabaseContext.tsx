import { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthError, AuthChangeEvent } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase, signInWithGoogle } from '@/lib/supabase';

interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signOut: async () => {},
});

export const useSupabase = () => useContext(SupabaseContext);

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and monitor auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle navigation based on auth state
      if (event === 'SIGNED_IN') {
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Auth functions
  const signIn = async (email: string, password: string) => {
    if (loading) return { error: null };
    
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Failed to sign in. Please try again.';
        let errorTitle = 'Sign In Failed';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorTitle = 'Email Not Verified';
          errorMessage = 'Please check your email and click the verification link to sign in.';
        } else if (error.message.includes('Too many requests')) {
          errorTitle = 'Rate Limited';
          errorMessage = 'Too many attempts. Please wait a few minutes and try again.';
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });

        return { error };
      }

      // Handle successful sign-in
      if (data.user) {
        toast({
          title: 'Welcome Back',
          description: 'Successfully signed in!',
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      toast({
        title: 'Connection Error',
        description: 'Having trouble connecting to the server. Please try again.',
        variant: 'destructive',
      });
      return { 
        error: { 
          message: 'Connection error',
          status: 503
        } as AuthError 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    if (loading) return { error: null };

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        let errorMessage = 'Failed to create account. Please try again.';
        let errorTitle = 'Sign Up Failed';
        
        if (error.message.includes('already registered')) {
          errorTitle = 'Email Already Registered';
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.message.includes('password')) {
          errorTitle = 'Invalid Password';
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('valid email')) {
          errorTitle = 'Invalid Email';
          errorMessage = 'Please enter a valid email address.';
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: 'destructive',
        });
        return { error };
      }

      // Check if email confirmation is required
      if (data?.user?.identities?.length === 0) {
        toast({
          title: 'Verification Required',
          description: 'Please check your email to verify your account.',
        });
      } else {
        toast({
          title: 'Account Created',
          description: 'Your account has been created successfully!',
        });
      }

      return { error: null };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      toast({
        title: 'Connection Error',
        description: 'Having trouble connecting to the server. Please try again in a few moments.',
        variant: 'destructive',
      });
      return { 
        error: { 
          message: 'Connection error',
          status: 503
        } as AuthError
      };
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return { error: null };
    
    try {
      setLoading(true);
      const { data, error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: 'Google Sign In Failed',
          description: error.message || 'Failed to sign in with Google',
          variant: 'destructive',
        });
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected error during Google sign in:', error);
      toast({
        title: 'Connection Error',
        description: 'Having trouble connecting to the server. Please try again.',
        variant: 'destructive',
      });
      return { 
        error: { 
          message: 'Connection error',
          status: 503
        } as AuthError 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (loading) return;

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Error signing out:', error);
        toast({
          title: 'Sign Out Failed',
          description: 'Failed to sign out. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      toast({
        title: 'Connection Error',
        description: 'Having trouble connecting to the server. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <SupabaseContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle: handleGoogleSignIn,
        signOut
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
};
