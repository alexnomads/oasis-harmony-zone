
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
        console.log('Auth callback page loaded, URL:', window.location.href);
        
        // Process the OAuth or email confirmation callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (data?.session) {
          console.log('Session found, verification successful');
          setVerificationState('success');
          toast({
            title: 'Email verified!',
            description: 'Your account has been verified. Welcome to Rose of Jericho!',
          });
          
          // Short delay to show success message before redirect
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          // Try to exchange code for session (specifically for email confirmation)
          const params = new URLSearchParams(window.location.search);
          const token = params.get('token_hash') || params.get('token');
          const type = params.get('type');
          
          console.log('Detected parameters:', { token: token ? 'present' : 'not present', type });
          
          if (token && type === 'email_confirmation') {
            const { error: confirmError } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'email_confirmation'
            });
            
            if (confirmError) {
              console.error('Confirmation error:', confirmError);
              throw confirmError;
            }
            
            setVerificationState('success');
            toast({
              title: 'Email verified!',
              description: 'Your account has been verified. Please sign in to continue.',
            });
            
            // Redirect to login page after successful verification
            setTimeout(() => navigate('/?login=true'), 1500);
          } else {
            console.error('No session or valid parameters found after verification');
            throw new Error('No session found after verification');
          }
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
