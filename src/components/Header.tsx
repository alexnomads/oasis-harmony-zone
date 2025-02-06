
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { RegisterForm } from "./auth/RegisterForm";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const [showSignIn, setShowSignIn] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-gradient-to-r from-vibrantPurple to-vibrantOrange backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left - Burger Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-gradient-to-br from-vibrantPurple to-vibrantOrange">
            <DropdownMenuItem onClick={() => scrollToSection("hero")} className="text-white hover:bg-white/10">
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("ai-agent-alpha")} className="text-white hover:bg-white/10">
              AI Agent
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("programs")} className="text-white hover:bg-white/10">
              Programs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("subscription-plans")} className="text-white hover:bg-white/10">
              Subscription Plans
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("token")} className="text-white hover:bg-white/10">
              ROJ Token
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("newsletter")} className="text-white hover:bg-white/10">
              Newsletter
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("roadmap")} className="text-white hover:bg-white/10">
              Roadmap
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center - Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/44ba5b42-989b-484b-be4b-a455227b3547.png" 
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
              className="border-white text-white bg-transparent hover:bg-white/10"
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
