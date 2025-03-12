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
        
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get('token_hash');
        const type = params.get('type');
        const error_description = params.get('error_description');
        
        console.log('Detected parameters:', { 
          token_hash: token_hash ? 'present' : 'not present', 
          type, 
          error_description 
        });
        
        if (error_description) {
          throw new Error(error_description);
        }
        
        if (token_hash && type === 'email_confirmation') {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email',
          });
          
          if (error) {
            console.error('Verification error:', error);
            throw error;
          }
          
          console.log('Email verification successful', data);
          
          setVerificationState('success');
          toast({
            title: 'Email verified!',
            description: 'Your account has been verified. Please sign in to continue.',
          });
          
          setTimeout(() => navigate('/?login=true'), 1500);
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (data?.session) {
          console.log('Session found, verification successful');
          setVerificationState('success');
          toast({
            title: 'Authentication successful!',
            description: 'Welcome to Rose of Jericho!',
          });
          
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          console.error('No session or valid parameters found');
          throw new Error('Invalid or expired verification link');
        }
      } catch (error) {
        console.error('Error during authentication callback:', error);
        setVerificationState('error');
        toast({
          title: 'Verification failed',
          description: error instanceof Error ? error.message : 'There was a problem verifying your email. Please try again.',
          variant: 'destructive',
        });
        
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
