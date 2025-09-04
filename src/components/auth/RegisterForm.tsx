
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
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
