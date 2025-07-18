import { Menu, Moon, Sun, User, Timer, LayoutDashboard, LogOut, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { AuthForm } from "./auth/AuthForm";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { MeditationService } from "@/lib/meditationService";
import { supabase } from "@/lib/supabase";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const [showSignIn, setShowSignIn] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const loadUserPoints = async () => {
      if (user) {
        try {
          const { points } = await MeditationService.getUserHistory(user.id);
          setPoints(points?.total_points || 0);
        } catch (error) {
          console.error('Error loading points:', error);
          setPoints(0);
        }
      } else {
        setPoints(0);
      }
    };
    loadUserPoints();
  }, [user]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 96;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
      <div className="h-1 w-full bg-gradient-to-r from-vibrantPurple to-vibrantOrange" />
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
                  <Menu className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-black/90 backdrop-blur-sm border border-zinc-800">
                <DropdownMenuItem onClick={() => navigate('/')} className="text-white hover:bg-white/5 focus:bg-white/5">
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/meditate')} className="text-white hover:bg-white/5 focus:bg-white/5">
                  <Timer className="mr-2 h-4 w-4" />
                  Meditate Now
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/5 focus:bg-white/5">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Your Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/global-dashboard')} className="text-white hover:bg-white/5 focus:bg-white/5">
                  <Globe className="mr-2 h-4 w-4" />
                  Global Dashboard
                </DropdownMenuItem>
                <div className="h-px bg-gradient-to-r from-vibrantPurple to-vibrantOrange my-1 opacity-50" />
                <DropdownMenuItem onClick={() => scrollToSection("programs")} className="text-white hover:bg-white/5 focus:bg-white/5">
                  Our Programs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("subscription-plans")} className="text-white hover:bg-white/5 focus:bg-white/5">
                  Subscription Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("token")} className="text-white hover:bg-white/5 focus:bg-white/5">
                  ROJ Token
                </DropdownMenuItem>
                <div className="h-px bg-gradient-to-r from-vibrantPurple to-vibrantOrange my-1 opacity-50" />
                <DropdownMenuItem onClick={() => scrollToSection("testimonials")} className="text-white hover:bg-white/5 focus:bg-white/5">
                  Testimonials
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("newsletter")} className="text-white hover:bg-white/5 focus:bg-white/5">
                  Contact Us
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("roadmap")} className="text-white hover:bg-white/5 focus:bg-white/5">
                  Roadmap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href="https://twitter.com/ROJOasis"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-white hover:text-white/80 text-sm font-medium"
            >
              <img 
                src="/lovable-uploads/0b88d178-91da-4c76-9d67-7e294d0a1de6.png" 
                alt="X Logo" 
                className="w-4 h-4 invert"
              />
              Follow @ROJOasis
            </a>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2">
            <img 
              src="/lovable-uploads/a707377f-d19b-40cc-a022-c7baa7bbced8.png" 
              alt="Rose of Jericho" 
              className="h-6 w-auto md:h-8 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>

          <div className="flex-1 flex items-center justify-end gap-2">
            {user && (
              <div className="hidden md:flex flex-col items-end mr-2">
                <span id="user-status" className="text-xs text-white">
                  {user.email?.split('@')[0]}
                </span>
                <span id="points-display" className="text-xs text-white">
                  Points: {points}
                </span>
              </div>
            )}
            
            <div className="relative">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-white text-white bg-transparent hover:bg-white/10"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-black/90 backdrop-blur-sm border border-zinc-800">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="text-white hover:bg-white/5 focus:bg-white/5">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Your Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/global-dashboard')} className="text-white hover:bg-white/5 focus:bg-white/5">
                      <Globe className="mr-2 h-4 w-4" />
                      Global Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/meditate')} className="text-white hover:bg-white/5 focus:bg-white/5">
                      <Timer className="mr-2 h-4 w-4" />
                      Meditate Now
                    </DropdownMenuItem>
                    <div className="h-px bg-gradient-to-r from-vibrantPurple to-vibrantOrange my-1 opacity-50" />
                    <DropdownMenuItem 
                      onClick={signOut} 
                      className="text-white hover:bg-white/5 focus:bg-white/5"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="border-white text-white bg-transparent hover:bg-white/10"
                    onClick={() => setShowSignIn(!showSignIn)}
                    aria-label="Sign In"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </Button>
                  {showSignIn && (
                    <div className="absolute right-0 mt-2 z-50">
                      <AuthForm />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {user && (
          <div className="md:hidden w-full flex justify-between text-white text-xs py-1 px-2">
            <span id="mobile-user-status">
              {user.email?.split('@')[0]}
            </span>
            <span id="mobile-points-display">
              Points: {points}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
