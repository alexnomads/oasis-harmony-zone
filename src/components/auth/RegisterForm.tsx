
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useSupabase } from "@/contexts/SupabaseContext";
import { signInWithGoogle } from "@/lib/supabase";

const authSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long')
    .max(72, 'Password must be less than 72 characters')
});

type AuthFormData = z.infer<typeof authSchema>;

export const RegisterForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signUp } = useSupabase();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: AuthFormData) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { error } = isLogin 
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password);

      if (error) {
        console.error('Auth error:', error);
        return;
      }

      // Reset form on success
      reset();
      
      // Close the form popup on successful sign-in
      if (isLogin) {
        const signInButton = document.querySelector('button[aria-label="Sign In"]') as HTMLButtonElement;
        if (signInButton) {
          signInButton.click();
        }
      }
    } catch (error) {
      console.error('Unexpected auth error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        console.error('Google sign-in error:', error);
        toast({
          title: 'Google Sign In Failed',
          description: error.message || 'Failed to sign in with Google. Please try again.',
          variant: 'destructive',
        });
      }
      
      // No need to close popup as redirect will happen
    } catch (error) {
      console.error('Unexpected Google sign-in error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
            {isLogin ? "Welcome Back" : "Join Our Community"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <p className="text-xs text-zinc-400 px-1">Enter your email address</p>
              )}
            </div>
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
                  {isLogin ? "Sign In" : "Create Account"}
                </>
              )}
            </Button>
          </form>
          
          <div className="flex items-center justify-center">
            <div className="flex-grow h-px bg-zinc-800"></div>
            <span className="px-3 text-xs text-zinc-500">OR</span>
            <div className="flex-grow h-px bg-zinc-800"></div>
          </div>
          
          <Button
            type="button"
            variant="outline"
            className="w-full border-zinc-700 text-white hover:bg-white/5 relative flex items-center justify-center space-x-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </Button>
          
          <div className="text-center">
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
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
