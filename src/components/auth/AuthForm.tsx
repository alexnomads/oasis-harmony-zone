
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { User, Wallet, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const authSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be less than 72 characters')
});

const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim())
});

type AuthFormData = z.infer<typeof authSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, resetPassword, signInWithSolana, signInWithX, loading } = useAuth();
  
  const form = useForm({
    resolver: zodResolver(showForgotPassword ? resetPasswordSchema : authSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = form;

  const onSubmit = async (data: any) => {
    if (loading) return;
    
    if (showForgotPassword) {
      await resetPassword(data.email);
      setResetEmailSent(true);
      return;
    }
    
    if (isLogin) {
      await signIn(data.email, data.password);
    } else {
      await signUp(data.email, data.password);
      reset();
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    reset();
    // Reset form validation schema by re-initializing
    form.clearErrors();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-[280px]"
    >
      <Card className="bg-zinc-900/90 border-zinc-800 backdrop-blur-sm overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-white text-center">
            {showForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Join Our Community"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {resetEmailSent ? (
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <p className="text-white">Check your email!</p>
                <p className="text-sm text-zinc-400">
                  We've sent you a password reset link. Check your email and follow the instructions to reset your password.
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-sm text-zinc-400 hover:text-white hover:bg-white/5"
                onClick={handleBackToLogin}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              {!showForgotPassword && (
                <>
                  <div className="space-y-2">
                    <Button
                      onClick={signInWithX}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-300 relative"
                    >
                      {loading ? (
                        <>
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                          </div>
                          <span className="opacity-0">Processing...</span>
                        </>
                      ) : (
                        <>
                          <Twitter className="mr-2 h-4 w-4" />
                          Sign in with X
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={signInWithSolana}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white transition-all duration-300 relative"
                    >
                      {loading ? (
                        <>
                          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                          </div>
                          <span className="opacity-0">Processing...</span>
                        </>
                      ) : (
                        <>
                          <Wallet className="mr-2 h-4 w-4" />
                          Sign in with Solana
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-zinc-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-zinc-900 px-2 text-zinc-400">Or continue with email</span>
                    </div>
                  </div>
                </>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-1">
                  <Input
                    type="email"
                    placeholder="Email"
                    {...register('email')}
                    className={`bg-white/5 border-zinc-700 text-white ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 px-1">{errors.email.message}</p>
                  )}
                  {!errors.email && (
                    <p className="text-xs text-zinc-400 px-1">
                      {showForgotPassword ? 'Enter your email to receive reset instructions' : 'Enter your email address'}
                    </p>
                  )}
                </div>
                {!showForgotPassword && (
                  <div className="space-y-1">
                    <Input
                      type="password"
                      placeholder="Password"
                      {...register('password')}
                      className={`bg-white/5 border-zinc-700 text-white ${errors.password ? 'border-red-500' : ''}`}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500 px-1">{errors.password.message}</p>
                    )}
                    {!errors.password && (
                      <p className="text-xs text-zinc-400 px-1">
                        {isLogin ? 'Enter your password' : 'Password must be at least 6 characters'}
                      </p>
                    )}
                  </div>
                )}
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange hover:opacity-90 text-white transition-all duration-300 relative"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                      </div>
                      <span className="opacity-0">Processing...</span>
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      {showForgotPassword ? "Send Reset Email" : isLogin ? "Sign In" : "Create Account"}
                    </>
                  )}
                </Button>
              </form>
              <div className="text-center space-y-2">
                {showForgotPassword ? (
                  <Button
                    variant="ghost"
                    className="text-sm text-zinc-400 hover:text-white hover:bg-white/5"
                    onClick={handleBackToLogin}
                  >
                    Back to Sign In
                  </Button>
                ) : (
                  <>
                    {isLogin && (
                      <Button
                        variant="ghost"
                        className="text-sm text-zinc-400 hover:text-white hover:bg-white/5 w-full"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        Forgot Password?
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="text-sm text-zinc-400 hover:text-white hover:bg-white/5"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        reset();
                      }}
                    >
                      {isLogin ? "Need an account? Register" : "Already have an account? Sign In"}
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
