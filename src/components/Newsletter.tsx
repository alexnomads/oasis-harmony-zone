import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const Newsletter = () => {
  return (
    <section className="py-24 bg-sage">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6 text-white">Stay Updated</h2>
          <p className="text-xl mb-8 text-white/90">
            Be the first to know about our launches and exclusive offers
          </p>
          <form className="flex flex-col sm:flex-row gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-14 rounded-full bg-white/90 border-0 text-gray-900 placeholder:text-gray-500"
            />
            <Button className="h-14 px-8 rounded-full bg-gold hover:bg-gold/90 text-white">
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};