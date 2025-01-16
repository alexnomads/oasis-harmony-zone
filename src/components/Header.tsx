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
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left - Burger Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-white/10 text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-white/95 backdrop-blur-md border-2 border-[#FEC6A1]">
            <DropdownMenuItem onClick={() => scrollToSection("hero")}>
              Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("ascii-art")}>
              ASCII Art
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("programs")}>
              Programs
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("token")}>
              ROJ Token
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("roadmap")}>
              Roadmap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => scrollToSection("newsletter")}>
              Newsletter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center - Logo */}
        <motion.div 
          className="flex items-center"
          whileHover={{ scale: 1.05 }}
        >
          <img 
            src="/lovable-uploads/d392e042-f503-4777-9d67-9d7149153ca5.png" 
            alt="Rose of Jericho" 
            className="h-8 w-auto"
          />
        </motion.div>

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
              className="border-2 border-white text-white bg-transparent hover:bg-white/10 rounded-full"
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
