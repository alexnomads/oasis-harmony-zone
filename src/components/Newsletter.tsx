import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const Newsletter = () => {
  return (
    <section className="py-12 bg-gradient-to-br from-vibrantPurple/90 to-vibrantOrange/90">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-white/10 text-white rounded-full">
            Join Our Community
          </span>
          <h2 className="text-4xl font-bold mb-6 text-white">Stay Connected</h2>
          <p className="text-xl mb-8 text-white/80">
            Be the first to know about Rose of Jericho & our community
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-14 rounded-full bg-black/20 border-white/20 text-white placeholder:text-white/60"
            />
            <Button className="h-14 px-8 rounded-full bg-softPurple hover:bg-softPurple/90 text-white transition-colors duration-300">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};