
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { Web3Provider } from './contexts/Web3Context';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Meditate from './pages/Meditate';
import GlobalDashboard from './pages/GlobalDashboard';
import Callback from './pages/auth/callback';
import Test from './pages/auth/test';
import DirectTest from './pages/auth/direct-test';
import Debug from './pages/auth/debug';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Lazy load the Profile component
const Profile = lazy(() => import('./pages/Profile'));

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
                    <Route path="/profile" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Profile />
                      </Suspense>
                    } />
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
