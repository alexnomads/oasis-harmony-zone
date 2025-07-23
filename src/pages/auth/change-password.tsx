
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const changePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export default function ChangePassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        
        console.log('Change password parameters:', { 
          code: code ? 'present' : 'missing',
          fullUrl: window.location.href
        });

        if (code) {
          // Exchange the code for a session
          console.log('Exchanging code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange error:', error);
            setIsAuthenticated(false);
          } else if (data.session) {
            console.log('Successfully exchanged code for session');
            setIsAuthenticated(true);
          } else {
            console.error('No session after code exchange');
            setIsAuthenticated(false);
          }
        } else {
          // Check existing session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          console.log('Change password session check:', {
            hasSession: !!session,
            error: error?.message,
            timestamp: new Date().toISOString()
          });

          if (error) {
            console.error('Session check error:', error);
            setIsAuthenticated(false);
          } else if (session) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Password reset handling failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    handlePasswordReset();
  }, []);

  const onSubmit = async (data: ChangePasswordData) => {
    setIsSubmitting(true);
    try {
      console.log('Attempting to update password...');
      
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        console.error('Password update error:', error);
        throw error;
      }

      console.log('Password updated successfully');
      
      toast({
        title: 'Password updated successfully',
        description: 'You can now sign in with your new password.',
      });

      // Redirect to home page after successful password change
      setTimeout(() => navigate('/?password_changed=true'), 2000);
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: 'Failed to update password',
        description: error instanceof Error ? error.message : 'An error occurred while updating your password.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-zinc-400">Please wait while we verify your session.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-4">
            This password reset link has expired or is invalid.
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/?request_reset=true')} 
              className="w-full"
            >
              Request New Reset Link
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-800 border-zinc-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white">Change Your Password</CardTitle>
          <CardDescription className="text-zinc-400">
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">New Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="bg-zinc-700 border-zinc-600 text-white"
                placeholder="Enter your new password"
              />
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="bg-zinc-700 border-zinc-600 text-white"
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
