
import { Menu, Moon, Sun, Wallet } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { RegisterForm } from "./auth/RegisterForm";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeb3 } from "@/contexts/Web3Context";
import { formatAddress } from "@/utils/web3Utils";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const [showSignIn, setShowSignIn] = useState(false);
  const { account, connectWallet, disconnectWallet, balance } = useWeb3();
  const [points, setPoints] = useState(0);

  // Mock function to load points - in a real app this would come from an API
  useEffect(() => {
    // Simulate loading points when wallet is connected
    if (account) {
      // This is just a placeholder - replace with actual API call
      const mockPoints = Math.floor(Math.random() * 1000);
      setPoints(mockPoints);
    } else {
      setPoints(0);
    }
  }, [account]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-vibrantPurple to-vibrantOrange backdrop-blur-sm">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left - Burger Menu */}
          <div className="flex-1">
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
                <DropdownMenuItem onClick={() => scrollToSection("contact")} className="text-white hover:bg-white/10">
                  Get in Touch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Center - Logo */}
          <div className="flex-1 flex justify-center">
            <img 
              src="/lovable-uploads/a707377f-d19b-40cc-a022-c7baa7bbced8.png" 
              alt="Rose of Jericho" 
              className="h-8 w-auto"
            />
          </div>

          {/* Right - Theme Toggle, Wallet Connection & Points */}
          <div className="flex-1 flex items-center justify-end gap-2">
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
            
            {/* Wallet Status and Points (visible on larger screens) */}
            <div className="hidden md:flex flex-col items-end mr-2">
              <span id="wallet-status" className="text-xs text-white">
                {account ? formatAddress(account) : "Not connected"}
              </span>
              <span id="points-display" className="text-xs text-white">
                Points: {points}
              </span>
            </div>
            
            {/* Connect Wallet Button */}
            <div className="relative">
              <Button
                id="connect-wallet-btn"
                variant="outline"
                className="border-white text-white bg-transparent hover:bg-white/10"
                onClick={() => {
                  if (showSignIn) {
                    setShowSignIn(false);
                  } else if (account) {
                    setShowSignIn(true);
                  } else {
                    connectWallet();
                  }
                }}
              >
                <Wallet className="mr-2 h-4 w-4" />
                {account ? "Connected" : "Connect Wallet"}
              </Button>
              {showSignIn && (
                <div className="absolute right-0 mt-2">
                  <RegisterForm />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile-only Wallet Info */}
        {account && (
          <div className="md:hidden w-full flex justify-between text-white text-xs py-1 px-2">
            <span id="mobile-wallet-status">
              {formatAddress(account)}
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
