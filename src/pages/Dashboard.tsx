import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [userDisplayName, setUserDisplayName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Use email prefix as default display name
      const emailPrefix = user.email?.split('@')[0] || 'User';
      setUserDisplayName(emailPrefix);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-900 text-white">
      <header className="flex justify-between items-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <img src="/lovable-uploads/97b94475-30c2-47c1-97f3-7fc62e26dd85.png" alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-bold">Harmony Oasis</h1>
        </div>
        <nav className="hidden md:flex space-x-4">
          <Link to="/dashboard" className="hover:text-softOrange transition-colors">Dashboard</Link>
          <Link to="/meditate" className="hover:text-softOrange transition-colors">Meditate</Link>
          <Link to="/global" className="hover:text-softOrange transition-colors">Global</Link>
          <Link to="/profile" className="hover:text-softOrange transition-colors">Profile</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/profile">
            <Avatar className="cursor-pointer">
              <AvatarFallback>{userDisplayName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <Button variant="outline" onClick={handleSignOut} className="border-zinc-700">
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="container max-w-5xl mx-auto p-4">
        <section className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Welcome to Harmony Oasis, {userDisplayName}!</h2>
          <p className="text-white/60">
            Explore our meditation exercises, track your progress, and connect with a global community of meditators.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Today's Meditation</h3>
            <p className="text-white/60">Start your day with a calming meditation session.</p>
            <Link to="/meditate" className="inline-block mt-4 bg-softOrange text-black py-2 px-4 rounded hover:bg-orange-500 transition-colors">
              Begin Meditation
            </Link>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
            <p className="text-white/60">View your meditation history and track your progress over time.</p>
            <Link to="/profile" className="inline-block mt-4 bg-softOrange text-black py-2 px-4 rounded hover:bg-orange-500 transition-colors">
              View Profile
            </Link>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <h3 className="text-xl font-semibold mb-2">Global Community</h3>
            <p className="text-white/60">Connect with meditators from around the world.</p>
            <Link to="/global" className="inline-block mt-4 bg-softOrange text-black py-2 px-4 rounded hover:bg-orange-500 transition-colors">
              Explore Global Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
