
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, error } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (error) {
      toast({
        title: 'Authentication Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white" />
          <p className="text-white text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to home page with a query parameter to show login modal
    return <Navigate to="/?login=true" replace />;
  }

  return <>{children}</>;
};
