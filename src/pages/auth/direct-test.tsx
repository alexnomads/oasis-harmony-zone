
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signInWithPassword } from '@/lib/supabase';

const SUPABASE_URL = "https://kesejxmbfvpkgnwofiys.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtlc2VqeG1iZnZwa2dud29maXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNzM0NjIsImV4cCI6MjA1NDg0OTQ2Mn0.uhIvHz-e0hDXH71YdPXlFlDK-aBCyjbttNi4qMy_PwE";

export default function DirectTest() {
  const [status, setStatus] = useState({
    loading: false,
    result: '',
  });
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const testDirectConnection = async () => {
    setStatus({ loading: true, result: 'Testing...' });
    try {
      // Test direct REST API call to Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/meditation_sessions?count=exact&limit=0`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      });

      const responseData = await response.text();
      console.log('Direct API Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
      });

      setStatus({
        loading: false,
        result: `Status: ${response.status}, Response: ${responseData}`,
      });
    } catch (error) {
      console.error('Direct test error:', error);
      setStatus({
        loading: false,
        result: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  const testDirectAuth = async () => {
    setStatus({ loading: true, result: 'Testing auth...' });
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Please enter email and password in the fields below');
      }
      
      // Test auth using the secure helper function
      const { data, error } = await signInWithPassword(
        credentials.email,
        credentials.password
      );

      if (error) {
        throw error;
      }

      setStatus({
        loading: false,
        result: `Auth Success: User ${data.user?.email} authenticated successfully`,
      });
      console.log('Auth Response:', data);
    } catch (error) {
      console.error('Direct auth test error:', error);
      setStatus({
        loading: false,
        result: `Auth Error: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8">Direct API Test</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Configuration</h2>
            <pre className="bg-zinc-900 p-4 rounded-lg overflow-auto">
              {JSON.stringify({
                url: SUPABASE_URL,
                hasKey: !!SUPABASE_KEY,
              }, null, 2)}
            </pre>
          </div>

          <div className="space-y-4">
            <Button
              onClick={testDirectConnection}
              disabled={status.loading}
              variant="outline"
              className="w-full"
            >
              Test Direct API Connection
            </Button>

            <div className="space-y-2 my-4">
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
              onClick={testDirectAuth}
              disabled={status.loading}
              variant="outline"
              className="w-full"
            >
              Test Auth
            </Button>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Result:</h3>
              <pre className="bg-zinc-900 p-4 rounded-lg overflow-auto whitespace-pre-wrap">
                {status.result || 'No test run yet'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
