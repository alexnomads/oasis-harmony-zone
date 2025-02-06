
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const SubscriptionPlans = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Subscription Plans</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Choose the perfect plan to unlock enhanced AI features and analytics
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Basic Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Basic Plan</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $20<span className="text-lg font-normal text-white/60">/month</span>
            </div>
            <p className="text-white/60 mb-2">Pay in $ROJ tokens</p>
            <ul className="text-white/80 text-left space-y-4 mb-8">
              <li>✓ Access to AI Wellness Agent</li>
              <li>✓ Basic wellness analytics</li>
              <li>✓ Standard support</li>
            </ul>
            <Button className="w-full bg-white/10 hover:bg-white/20 text-white">
              Get Started
            </Button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-white/20 hover:border-white/30 transition-all transform scale-105 relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9C27B0] to-[#FF8A00] px-4 py-1 rounded-full text-sm font-semibold text-white">
              Popular
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pro Plan</h3>
            <div className="text-3xl font-bold text-white mb-4">
              $50<span className="text-lg font-normal text-white/60">/month</span>
            </div>
            <p className="text-white/60 mb-2">Pay in $ROJ tokens</p>
            <ul className="text-white/80 text-left space-y-4 mb-8">
              <li>✓ Enhanced AI features</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Exclusive content</li>
              <li>✓ Priority support</li>
            </ul>
            <Button className="w-full bg-gradient-to-r from-[#9C27B0] to-[#FF8A00] hover:opacity-90 text-white">
              Upgrade to Pro
            </Button>
          </motion.div>

          {/* Enterprise Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
            <div className="text-3xl font-bold text-white mb-4">
              Custom
            </div>
            <p className="text-white/60 mb-2">Tailored solutions</p>
            <ul className="text-white/80 text-left space-y-4 mb-8">
              <li>✓ Custom AI implementation</li>
              <li>✓ Multiple users usage</li>
              <li>✓ Dedicated support team</li>
              <li>✓ Custom integrations</li>
            </ul>
            <Button className="w-full bg-white/10 hover:bg-white/20 text-white">
              Contact Sales
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
