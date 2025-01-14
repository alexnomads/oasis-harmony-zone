import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { RegisterForm } from "./auth/RegisterForm";
import { useState } from "react";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-[#ea384c] dark:bg-[#ea384c] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left - Burger Menu */}
        <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
          <Menu className="h-5 w-5" />
        </Button>

        {/* Center - Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/d392e042-f503-4777-9d67-9d7149153ca5.png" 
            alt="Rose of Jericho" 
            className="h-8 w-auto"
          />
        </div>

        {/* Right - Theme Toggle & Sign In */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hover:bg-white/10 text-white"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <div className="relative">
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => setShowSignIn(!showSignIn)}
            >
              Sign In
            </Button>
            {showSignIn && (
              <div className="absolute right-0 mt-2">
                <RegisterForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};