import { useState } from 'react';
import { Button } from '@/components/ui/button';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function DirectTest() {
  const [status, setStatus] = useState({
    loading: false,
    result: '',
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
      // Test direct auth API call
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'colivingvalley@gmail.com',
          password: 'Alex1987+',
        }),
      });

      const responseData = await response.text();
      console.log('Direct Auth Response:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
      });

      setStatus({
        loading: false,
        result: `Auth Status: ${response.status}, Response: ${responseData}`,
      });
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

            <Button
              onClick={testDirectAuth}
              disabled={status.loading}
              variant="outline"
              className="w-full"
            >
              Test Direct Auth
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
