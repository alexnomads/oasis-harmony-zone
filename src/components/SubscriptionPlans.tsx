import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const SubscriptionPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<null | {
    title: string;
    price: number;
  }>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { account, connectWallet } = useWeb3();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const plans = [
    {
      title: "Basic Plan",
      price: 0,
      period: "forever",
      features: [
        "Access to AI Wellness Agent",
        "Basic wellness analytics",
        "Standard support",
        "Access to online community"
      ]
    },
    {
      title: "Pro Plan",
      monthlyPrice: 20,
      yearlyPrice: 192, // 20% discount
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

  const handlePurchase = async () => {
    if (!account) {
      connectWallet();
      return;
    }

    if (!selectedPlan) return;

    setIsProcessing(true);
    
    // Simulate transaction processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Subscription Activated",
        description: `You've successfully subscribed to the ${selectedPlan.title}! Enjoy your ROJ experience.`,
      });
      
      setSelectedPlan(null);
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBasicPlanClick = () => {
    if (user) {
      navigate('/meditate');
    } else {
      if (!account) {
        connectWallet();
      }
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]" id="subscription-plans">
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
              
              {plan.title === "Basic Plan" ? (
                <div className="text-3xl font-bold text-white mb-4">
                  FREE
                  <span className="text-lg font-normal text-white/60">
                    /forever
                  </span>
                </div>
              ) : !plan.custom ? (
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
              
              {plan.title !== "Basic Plan" && (
                <p className="text-white/60 mb-2">Pay in $ROJ tokens</p>
              )}
              
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
              ) : plan.title === "Basic Plan" ? (
                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white"
                  onClick={handleBasicPlanClick}
                >
                  {user ? (
                    <>
                      <Clock className="mr-2" size={20} />
                      Meditate Now
                    </>
                  ) : (
                    account ? "Get Started" : "Connect Wallet"
                  )}
                </Button>
              ) : (
                <Button 
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-[#9C27B0] to-[#FF8A00] hover:opacity-90"
                      : "bg-white/10 hover:bg-white/20"
                  } text-white`}
                  onClick={() => {
                    if (!account) {
                      connectWallet();
                    } else {
                      setSelectedPlan({
                        title: plan.title,
                        price: isYearly ? plan.yearlyPrice : plan.monthlyPrice
                      });
                    }
                  }}
                >
                  {account ? (plan.popular ? "Upgrade to Pro" : "Get Started") : "Connect Wallet"}
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subscription Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription className="text-zinc-400">
              You're about to subscribe to the {selectedPlan?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Plan</span>
                <span className="text-white">{selectedPlan?.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Duration</span>
                <span className="text-white">{isYearly ? 'Yearly' : 'Monthly'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Price</span>
                <span className="text-white">${selectedPlan?.price} in $ROJ</span>
              </div>
              <div className="border-t border-zinc-700 my-2 pt-2 flex justify-between">
                <span className="text-zinc-400">Total</span>
                <span className="text-white font-bold">${selectedPlan?.price} in $ROJ</span>
              </div>
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-[#9C27B0] to-[#FF8A00]"
              onClick={handlePurchase}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
