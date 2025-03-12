
import { Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const version = "1.0.0"; // You can update this manually or integrate with your build system
  
  return (
    <footer className="bg-black py-10 border-t border-white/10">
      <div className="container mx-auto px-6">
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
                onClick={() => window.open('https://www.linkedin.com/showcase/roseofjericho/', '_blank')}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
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
