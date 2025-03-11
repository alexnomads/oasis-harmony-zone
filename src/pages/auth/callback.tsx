
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Check if we have a hash fragment or query parameters in the URL
        // This handles both email confirmation and magic link flows
        const hasHashFragment = window.location.hash && window.location.hash.length > 0;
        const hasQueryParams = window.location.search && window.location.search.length > 0;

        if (hasHashFragment || hasQueryParams) {
          // This will trigger Supabase Auth to handle the confirmation
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            throw error;
          }

          if (data?.session) {
            setVerificationState('success');
            toast({
              title: 'Email verified!',
              description: 'Your account has been verified. Welcome to Rose of Jericho!',
            });
            
            // Short delay to show success message before redirect
            setTimeout(() => navigate('/dashboard'), 1500);
          } else {
            throw new Error('No session found after verification');
          }
        } else {
          // No query params or hash, possibly a direct visit to this route
          navigate('/');
        }
      } catch (error) {
        console.error('Error during email confirmation:', error);
        setVerificationState('error');
        toast({
          title: 'Verification failed',
          description: 'There was a problem verifying your email. Please try again.',
          variant: 'destructive',
        });
        
        // Short delay to show error message before redirect
        setTimeout(() => navigate('/'), 2000);
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        {verificationState === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
            <p className="text-zinc-400">Please wait while we confirm your account.</p>
          </>
        )}
        
        {verificationState === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
            <p className="text-zinc-400 mb-4">Your account has been successfully verified.</p>
            <p className="text-zinc-400">Redirecting you to the dashboard...</p>
          </>
        )}
        
        {verificationState === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-zinc-400 mb-4">There was a problem verifying your email.</p>
            <p className="text-zinc-400">Redirecting you to the homepage...</p>
          </>
        )}
      </div>
    </div>
  );
}
