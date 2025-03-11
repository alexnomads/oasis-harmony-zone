import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        toast({
          title: 'Email verified!',
          description: 'Your account has been verified. Welcome to Rose of Jericho!',
        });
        
        // Redirect to dashboard after successful verification
        navigate('/dashboard');
      } catch (error) {
        console.error('Error during email confirmation:', error);
        toast({
          title: 'Verification failed',
          description: 'There was a problem verifying your email. Please try again.',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Verifying your email...</h1>
        <p className="text-zinc-400">Please wait while we confirm your account.</p>
      </div>
    </div>
  );
}
