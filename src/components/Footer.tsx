
import { Linkedin, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const version = "1.0.0"; // You can update this manually or integrate with your build system
  
  return (
    <footer className="relative overflow-hidden py-10 border-t border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-deep-violet/40 via-primary/20 to-secondary/30"></div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Left - Logo and info */}
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/a707377f-d19b-40cc-a022-c7baa7bbced8.png" 
              alt="Rose of Jericho" 
              className="h-12 w-auto"
            />
            <p className="text-white/70 text-sm">
              Elevating wellness in the digital age through AI and blockchain technology.
            </p>
            <p className="text-white/50 text-xs">Version: {version}</p>
          </div>
          
          {/* Middle - Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white/70">
              <li className="hover:text-white transition-colors">
                <a href="#hero">Home</a>
              </li>
              <li className="hover:text-white transition-colors">
                <a href="#programs">Programs</a>
              </li>
              <li className="hover:text-white transition-colors">
                <a href="#subscription-plans">Subscription Plans</a>
              </li>
              <li className="hover:text-white transition-colors">
                <a href="#token">ROJ Token</a>
              </li>
              <li className="hover:text-white transition-colors">
                <a href="#roadmap">Roadmap</a>
              </li>
              <li className="hover:text-white transition-colors">
                <a href="#newsletter">Contact Us</a>
              </li>
              <li className="hover:text-white transition-colors">
                <a href="#testimonials">Testimonials</a>
              </li>
            </ul>
          </div>
          
          {/* Right - Social and Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-3 mb-4">
              <Button 
                variant="outline" 
                size="icon"
                className="border-white/10 text-white hover:bg-white/10"
                onClick={() => window.open('https://x.com/ROJOasis', '_blank')}
              >
                <img 
                  src="/lovable-uploads/0b88d178-91da-4c76-9d67-7e294d0a1de6.png" 
                  alt="X Logo" 
                  className="h-4 w-4 invert"
                />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="border-white/10 text-white hover:bg-white/10"
                onClick={() => window.open('https://www.linkedin.com/company/roseofjericho-roj/', '_blank')}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="border-white/10 text-white hover:bg-white/10"
                onClick={() => window.open('https://www.youtube.com/@ROJOasis', '_blank')}
                aria-label="Visit our YouTube channel"
              >
                <Youtube className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="border-white/10 text-white hover:bg-white/10"
                onClick={() => window.open('https://t.me/RoseOfJerichoweb3', '_blank')}
                aria-label="Join us on Telegram"
              >
                <img 
                  src="/lovable-uploads/telegram.svg" 
                  alt="Telegram logo" 
                  className="h-4 w-4 invert" 
                />
              </Button>
            </div>
            <div className="mt-2">
              <a href="https://www.producthunt.com/products/rose-of-jericho-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-rose&#0045;of&#0045;jericho&#0045;2" target="_blank" rel="noopener noreferrer">
                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1004503&theme=light&t=1755011209617" alt="Rose&#0032;of&#0032;Jericho - AI&#0032;Agent&#0032;giving&#0032;web3&#0032;rewards&#0032;when&#0032;you&#0032;meditate🌹🧘🏻 | Product Hunt" width="250" height="54" loading="lazy" />
              </a>
            </div>
            <p className="text-white/50 text-xs mt-4">
              © {currentYear} Rose of Jericho. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
