
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !message) {
      toast.error("Please provide both email and message");
      return;
    }
    
    // Here you would typically handle the form submission
    // For now, we'll just open the email client
    window.location.href = `mailto:roseofjerichooo@gmail.com?subject=Contact from ${email}&body=${encodeURIComponent(message)}`;
    
    // Reset form
    setEmail("");
    setMessage("");
    
    // Show success message
    toast.success("Email client opened to send your message");
  };

  return (
    <section id="newsletter" className="py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-primary/15 to-secondary/25"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,hsl(var(--deep-violet))_0%,transparent_45%),radial-gradient(circle_at_85%_15%,hsl(var(--neon-magenta))_0%,transparent_45%),radial-gradient(circle_at_50%_50%,hsl(var(--electric-cyan))_0%,transparent_55%)]"></div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            Get In Touch
          </span>
          <h2 className="text-4xl font-bold mb-6 text-white">Contact Us</h2>
          <p className="text-xl mb-8 text-white/80">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Your email address"
              className="h-14 rounded-full bg-black/20 border-white/20 text-white placeholder:text-white/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Textarea
              placeholder="Your message"
              className="min-h-[120px] rounded-xl bg-black/20 border-white/20 text-white placeholder:text-white/60"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button 
              type="submit"
              className="retro-button h-14 px-8 rounded-full mt-2"
            >
              Send a message
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};
