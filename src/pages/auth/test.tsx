
import { useState } from 'react';
import { signInWithPassword, getSession } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function AuthTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const testSignIn = async () => {
    if (!credentials.email || !credentials.password) {
      setResult({
        success: false,
        error: 'Please enter email and password'
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await signInWithPassword(
        credentials.email,
        credentials.password
      );
      
      setResult({
        success: !error,
        data,
        error: error?.message
      });
      
      console.log('Sign in result:', { data, error });
    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSession();
      
      setResult({
        success: !error,
        session: data.session,
        error: error?.message
      });
      
      console.log('Current session:', { session: data.session, error });
    } catch (error) {
      console.error('Session check failed:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">Auth Test Page</h1>
        
        <div className="space-y-4">
          <div className="space-y-2 mb-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 rounded-lg bg-zinc-800 text-white border border-zinc-700"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>
          
          <Button
            onClick={testSignIn}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Sign In'}
          </Button>

          <Button
            onClick={checkSession}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Checking...' : 'Check Current Session'}
          </Button>
        </div>

        {result && (
          <pre className="bg-zinc-900 p-4 rounded-lg overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
