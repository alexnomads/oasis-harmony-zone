
import { Linkedin, MessageCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const GetInTouch = () => {
  return (
    <div id="contact" className="py-16 px-4">
      <Card className="max-w-2xl mx-auto bg-black/20 border-white/10">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold text-center text-white mb-6">Get in Touch with the Founder</h2>
          <p className="text-white/80 text-center mb-8">
            Connect with our founder to learn more about Rose of Jericho and join our mission of bringing mindfulness to the crypto community.
          </p>
          <div className="flex justify-center gap-8">
            <a 
              href="https://x.com/alexnomads" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-softOrange transition-colors"
            >
              <X className="w-8 h-8" />
            </a>
            <a 
              href="https://www.linkedin.com/in/alessandrocapezza/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-softOrange transition-colors"
            >
              <Linkedin className="w-8 h-8" />
            </a>
            <a 
              href="http://t.me/alexnomads" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white/80 hover:text-softOrange transition-colors"
            >
              <MessageCircle className="w-8 h-8" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
