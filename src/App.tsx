import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { Web3Provider } from './contexts/Web3Context';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Meditate from './pages/Meditate';
import GlobalDashboard from './pages/GlobalDashboard';
import Callback from './pages/Callback';
import Test from './pages/Test';
import DirectTest from './pages/DirectTest';
import Debug from './pages/Debug';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Simulate initialization process
    setTimeout(() => {
      setIsInitialized(true);
    }, 500);
  }, []);

  return (
    <div className="App">
      <SupabaseProvider>
        <Web3Provider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  
                  {/* Authentication Routes */}
                  <Route path="/auth/callback" element={<Callback />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/meditate" element={<Meditate />} />
                    <Route path="/global" element={<GlobalDashboard />} />
                    <Route path="/profile" element={<React.lazy(() => import('./pages/Profile'))} />
                  </Route>
                  
                  {/* Debug Routes */}
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <Route path="/auth/test" element={<Test />} />
                      <Route path="/auth/direct-test" element={<DirectTest />} />
                      <Route path="/auth/debug" element={<Debug />} />
                    </>
                  )}
                </Routes>
                <Toaster />
              </Router>
            </QueryClientProvider>
          </AuthProvider>
        </Web3Provider>
      </SupabaseProvider>
    </div>
  );
}

export default App;
