
import { Linkedin, MessageCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const GetInTouch = () => {
  return (
    <div id="contact" className="py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-secondary/15 to-primary/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_80%,hsl(var(--deep-violet))_0%,transparent_45%),radial-gradient(circle_at_70%_20%,hsl(var(--neon-magenta))_0%,transparent_45%)]"></div>
      <Card className="max-w-2xl mx-auto bg-black/20 border-white/10 relative z-10">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-6">Get in Touch with the Founder</h2>
          <p className="text-white/80 text-center mb-8">
            Connect with our founder to learn more about ROJ and join our mission of bringing mindfulness to the global crypto community.
          </p>
          <div className="flex justify-center gap-8">
            <a 
              href="https://x.com/alexnomads" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-primary transition-colors"
            >
              <X className="w-8 h-8" />
            </a>
            <a 
              href="https://www.linkedin.com/in/alessandrocapezza/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-primary transition-colors"
            >
              <Linkedin className="w-8 h-8" />
            </a>
            <a 
              href="http://t.me/alexnomads" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-primary transition-colors"
            >
              <MessageCircle className="w-8 h-8" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
