import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token_hash = params.get('token_hash');
        const type = params.get('type');
        const code = params.get('code');
        const error_description = params.get('error_description');
        const next_url = params.get('next') || '/dashboard';
        
        // Debug info for verification process
        console.log('Auth callback parameters:', {
          token_hash: token_hash ? 'present' : 'not present',
          code: code ? 'present' : 'not present',
          type,
          error_description,
          next_url,
          full_url: window.location.href,
          timestamp: new Date().toISOString()
        });

        // If there's an error in the URL, handle it
        if (error_description) {
          console.error('URL contains error:', error_description);
          throw new Error(error_description);
        }

        // Handle password recovery - support both old and new format
        if (code) {
          console.log('Password recovery detected with code, redirecting to change-password page');
          // Pass the code and other parameters to change-password page
          const changePasswordUrl = `/change-password?${window.location.search}`;
          navigate(changePasswordUrl);
          return;
        }
        
        if (token_hash && type === 'recovery') {
          console.log('Password recovery detected with token_hash, redirecting to reset-password page');
          const resetUrl = `/auth/reset-password?${window.location.search}`;
          navigate(resetUrl);
          return;
        }

        // Handle email verification and other types
        if (token_hash && type) {
          console.log('Attempting verification with type:', type);

          // Support email verification types
          if (type !== 'email_confirmation' && type !== 'email' && type !== 'signup') {
            throw new Error(`Invalid verification type: ${type}`);
          }

          const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email',
          });

          console.log('Verification attempt result:', {
            success: !error,
            error: error?.message,
            data: data ? 'present' : 'none',
            timestamp: new Date().toISOString()
          });

          if (error) {
            throw error;
          }

          // Successful verification
          setVerificationState('success');
          toast({
            title: 'Email verified!',
            description: 'Your account has been verified. You can now sign in.',
          });

          // Give user time to see success message before redirect
          setTimeout(() => navigate('/?verified=true'), 2000);
          return;
        }

        // If no token_hash, check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session check:', {
          hasSession: !!session,
          error: sessionError?.message,
          timestamp: new Date().toISOString()
        });

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          setVerificationState('success');
          toast({
            title: 'Authentication successful!',
            description: 'Welcome to Rose of Jericho!',
          });
          setTimeout(() => navigate(next_url), 2000);
        } else {
          throw new Error('No verification token or active session found');
        }

      } catch (error) {
        console.error('Verification error:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });

        setVerificationState('error');
        
        const errorMessage = error instanceof Error 
          ? error.message
          : 'Unable to verify email. Please try signing up again or contact support.';
        
        toast({
          title: 'Verification failed',
          description: errorMessage,
          variant: 'destructive',
        });

        // On error, redirect to home page with error parameter
        setTimeout(() => navigate('/?verification_failed=true'), 3000);
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
            <p className="text-zinc-400">Redirecting you to sign in...</p>
          </>
        )}
        
        {verificationState === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-zinc-400 mb-4">There was a problem verifying your email.</p>
            <p className="text-zinc-400">Please try signing up again. If the problem persists, contact support.</p>
          </>
        )}
      </div>
    </div>
  );
}
