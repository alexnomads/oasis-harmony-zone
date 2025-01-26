import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const Newsletter = () => {
  return (
    <section className="py-12 bg-sage">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium bg-blush/20 text-charcoal rounded-full">
            Join Our Community
          </span>
          <h2 className="text-4xl font-bold mb-6 text-charcoal">Stay Connected</h2>
          <p className="text-xl mb-8 text-charcoal/80">
            Be the first to know about Rose of Jericho & our community
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-14 rounded-full bg-beige/50 border-skyblue text-charcoal placeholder:text-charcoal/60"
            />
            <Button className="h-14 px-8 rounded-full bg-skyblue hover:bg-skyblue/90 text-charcoal transition-colors duration-300">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};