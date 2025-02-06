
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const SubscriptionPlans = () => {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      title: "Basic Plan",
      monthlyPrice: 20,
      yearlyPrice: 192, // 20% discount
      features: [
        "Access to AI Wellness Agent",
        "Basic wellness analytics",
        "Standard support",
        "Access to online community"
      ]
    },
    {
      title: "Pro Plan",
      monthlyPrice: 50,
      yearlyPrice: 480, // 20% discount
      features: [
        "Enhanced AI features",
        "Advanced analytics",
        "IRL Pop-up Access",
        "Priority support"
      ],
      popular: true
    },
    {
      title: "Enterprise",
      features: [
        "Custom AI implementation",
        "Multiple users usage",
        "Dedicated support team",
        "Custom integrations"
      ],
      custom: true
    }
  ];

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
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Choose the perfect plan to unlock enhanced AI features and analytics
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-white/80">Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-softOrange"
            />
            <span className="text-white/80">Yearly (20% off)</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`bg-black/20 backdrop-blur-sm rounded-2xl p-8 border ${
                plan.popular
                  ? "border-2 border-white/20 hover:border-white/30 transform scale-105 relative"
                  : "border-white/10 hover:border-white/20"
              } transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#9C27B0] to-[#FF8A00] px-4 py-1 rounded-full text-sm font-semibold text-white">
                  Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.title}</h3>
              {!plan.custom ? (
                <div className="text-3xl font-bold text-white mb-4">
                  ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  <span className="text-lg font-normal text-white/60">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-white mb-4">
                  Custom
                </div>
              )}
              <p className="text-white/60 mb-2">Pay in $ROJ tokens</p>
              <ul className="text-white/80 text-left space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
              {plan.title === "Enterprise" ? (
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={() => window.open('https://t.me/alexnomads', '_blank')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Us
                </Button>
              ) : (
                <Button 
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#9C27B0] to-[#FF8A00] hover:opacity-90"
                      : "bg-white/10 hover:bg-white/20"
                  } text-white`}
                >
                  {plan.popular ? "Upgrade to Pro" : "Get Started"}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
