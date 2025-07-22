
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

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tokenValidationError, setTokenValidationError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        console.log('Reset password page - URL parameters:', {
          token_hash: token_hash ? 'present' : 'not present',
          type,
          full_url: window.location.href,
          search_params: window.location.search,
          timestamp: new Date().toISOString()
        });

        if (!token_hash) {
          console.error('No token_hash found in URL parameters');
          setTokenValidationError('No reset token found in the URL.');
          setIsValidToken(false);
          return;
        }

        if (type !== 'recovery') {
          console.error('Invalid type for password reset:', type);
          setTokenValidationError('Invalid reset link type.');
          setIsValidToken(false);
          return;
        }

        console.log('Attempting to verify recovery token...');

        // Verify the recovery token with Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'recovery',
        });

        console.log('Token verification result:', {
          success: !error,
          error: error?.message,
          data: data ? 'present' : 'none',
          timestamp: new Date().toISOString()
        });

        if (error) {
          console.error('Token validation error:', error);
          setTokenValidationError(error.message || 'Token validation failed');
          setIsValidToken(false);
          toast({
            title: 'Invalid or expired link',
            description: 'This password reset link is invalid or has expired. Please request a new one.',
            variant: 'destructive',
          });
        } else {
          console.log('Token validation successful');
          setIsValidToken(true);
          setTokenValidationError(null);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setTokenValidationError(errorMessage);
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [searchParams, toast]);

  const onSubmit = async (data: ResetPasswordData) => {
    if (!isValidToken) {
      console.error('Attempted to submit with invalid token');
      return;
    }

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

      // Redirect to home page after successful password reset
      setTimeout(() => navigate('/?password_reset=true'), 2000);
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: 'Failed to update password',
        description: error instanceof Error ? error.message : 'An error occurred while updating your password.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestNewResetLink = () => {
    navigate('/?request_reset=true');
  };

  if (isValidToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Validating reset link...</h1>
          <p className="text-zinc-400">Please wait while we verify your password reset link.</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-zinc-400 mb-4">
            This password reset link is invalid or has expired.
          </p>
          {tokenValidationError && (
            <p className="text-red-400 text-sm mb-4">
              Error: {tokenValidationError}
            </p>
          )}
          <div className="space-y-2">
            <Button 
              onClick={handleRequestNewResetLink} 
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
          <CardTitle className="text-2xl text-white">Reset Your Password</CardTitle>
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
