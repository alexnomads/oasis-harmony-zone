import { Menu, Moon, Sun, User, Timer, LayoutDashboard, LogOut, Globe } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { AuthForm } from "./auth/AuthForm";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [points, setPoints] = useState(0);

  // Check for login URL parameter to trigger sign-in modal
  useEffect(() => {
    const loginParam = searchParams.get('login');
    if (loginParam === 'true' && !user) {
      setShowSignIn(true);
      // Clean up the URL parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('login');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, user, setSearchParams]);

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
    <header className="fixed top-0 left-0 right-0 z-50 crt-frame bg-background/95 backdrop-blur-sm">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="retro-button p-2">
                  <Menu className="h-4 w-4 md:h-5 md:w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 tape-card">
                <DropdownMenuItem onClick={() => navigate('/')} className="retro-text hover:bg-primary/20">
                  Home
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/meditate')} className="retro-text hover:bg-primary/20">
                  <Timer className="mr-2 h-4 w-4" />
                  Wellness Zone
                </DropdownMenuItem>
                {user && (
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="retro-text hover:bg-primary/20">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Your Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/global-dashboard')} className="retro-text hover:bg-primary/20">
                  <Globe className="mr-2 h-4 w-4" />
                  Global Dashboard
                </DropdownMenuItem>
                <div className="h-px bg-gradient-to-r from-primary to-secondary my-1 opacity-50" />
                <DropdownMenuItem onClick={() => scrollToSection("programs")} className="retro-text hover:bg-primary/20">
                  Our Programs
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("subscription-plans")} className="retro-text hover:bg-primary/20">
                  Subscription Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("token")} className="retro-text hover:bg-primary/20">
                  ROJ Token
                </DropdownMenuItem>
                <div className="h-px bg-gradient-to-r from-primary to-secondary my-1 opacity-50" />
                <DropdownMenuItem onClick={() => scrollToSection("testimonials")} className="retro-text hover:bg-primary/20">
                  Testimonials
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("newsletter")} className="retro-text hover:bg-primary/20">
                  Contact Us
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("roadmap")} className="retro-text hover:bg-primary/20">
                  Roadmap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a
              href="https://twitter.com/ROJOasis"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-secondary hover:text-accent retro-text font-medium transition-colors"
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
              src="/lovable-uploads/277670c3-781e-4608-8e2f-d502243f163b.png" 
              alt="Rose of Jericho" 
              className="h-6 w-auto md:h-8 cursor-pointer drop-shadow-[0_0_10px_hsl(var(--primary))]"
              onClick={() => navigate('/')}
            />
          </div>

          <div className="flex-1 flex items-center justify-end gap-2">
            {user && (
              <div className="hidden md:flex flex-col items-end mr-2">
                <span id="user-status" className="text-xs retro-text text-secondary">
                  {user.email?.split('@')[0]}
                </span>
                <span id="points-display" className="text-xs retro-text text-accent">
                  Points: {points}
                </span>
              </div>
            )}
            
            <div className="relative">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="retro-button px-4 py-2 text-sm">
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 tape-card">
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="retro-text hover:bg-primary/20">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Your Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/global-dashboard')} className="retro-text hover:bg-primary/20">
                      <Globe className="mr-2 h-4 w-4" />
                      Global Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/meditate')} className="retro-text hover:bg-primary/20">
                      <Timer className="mr-2 h-4 w-4" />
                      Wellness Zone
                    </DropdownMenuItem>
                    <div className="h-px bg-gradient-to-r from-primary to-secondary my-1 opacity-50" />
                    <DropdownMenuItem 
                      onClick={signOut} 
                      className="retro-text hover:bg-destructive/20"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <button
                    className="retro-button px-4 py-2 text-sm"
                    onClick={() => setShowSignIn(!showSignIn)}
                    aria-label="Sign In"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Sign In
                  </button>
                  {showSignIn && (
                    <div className="absolute right-0 mt-2 z-50">
                      <div className="tape-card">
                        <AuthForm />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {user && (
          <div className="md:hidden w-full flex justify-between retro-text text-xs py-1 px-2">
            <span id="mobile-user-status" className="text-secondary">
              {user.email?.split('@')[0]}
            </span>
            <span id="mobile-points-display" className="text-accent">
              Points: {points}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
