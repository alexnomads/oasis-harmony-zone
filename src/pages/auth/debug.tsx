
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase, signInWithPassword } from '@/lib/supabase';

export default function AuthDebug() {
  const [status, setStatus] = useState({
    env: {
      url: import.meta.env.VITE_SUPABASE_URL || 'Not found',
      hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    connection: 'Not tested',
    auth: 'Not tested',
    loading: false,
  });
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  // Test basic Supabase connection
  const testConnection = async () => {
    setStatus(prev => ({ ...prev, loading: true, connection: 'Testing...' }));
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('count()')
        .limit(1);

      setStatus(prev => ({
        ...prev,
        connection: error ? `Error: ${error.message}` : 'Success',
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        connection: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Test authentication
  const testAuth = async () => {
    setStatus(prev => ({ ...prev, loading: true, auth: 'Testing...' }));
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter email and password in the fields below');
      }
      
      const { data, error } = await signInWithPassword(
        credentials.email,
        credentials.password
      );

      if (error) throw error;

      const session = await supabase.auth.getSession();
      
      setStatus(prev => ({
        ...prev,
        auth: `Success - User: ${data.user?.email}`,
      }));
      
      console.log('Auth debug:', {
        signInResult: data,
        session: session.data.session,
      });
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        auth: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      console.error('Auth debug error:', error);
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>
        
        <div className="space-y-6">
          {/* Environment Check */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Environment Variables</h2>
            <pre className="bg-zinc-900 p-4 rounded-lg overflow-auto">
              {JSON.stringify(status.env, null, 2)}
            </pre>
          </div>

          {/* Connection Test */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Database Connection</h2>
            <div className="flex items-center gap-4">
              <Button
                onClick={testConnection}
                disabled={status.loading}
                variant="outline"
              >
                Test Connection
              </Button>
              <span className="text-sm">
                Status: {status.connection}
              </span>
            </div>
          </div>

          {/* Auth Test */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Authentication</h2>
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
            <div className="flex items-center gap-4">
              <Button
                onClick={testAuth}
                disabled={status.loading}
                variant="outline"
              >
                Test Auth
              </Button>
              <span className="text-sm">
                Status: {status.auth}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
