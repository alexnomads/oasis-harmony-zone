
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Clock, MessageSquare } from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TokenBuyButton } from "@/components/TokenBuyButton";

interface PlanFeature {
  title: string;
}

interface PlanCardProps {
  plan: {
    title: string;
    price?: number;
    monthlyPrice?: number;
    yearlyPrice?: number;
    period?: string;
    features: string[];
    popular?: boolean;
    custom?: boolean;
  };
  isYearly: boolean;
  index: number;
  onSelectPlan: (title: string, price: number) => void;
}

export const PlanCard = ({ plan, isYearly, index, onSelectPlan }: PlanCardProps) => {
  const { account, connectWallet } = useWeb3();
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`bg-black/20 backdrop-blur-sm rounded-2xl p-8 border flex flex-col ${
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
      
      <ul className="text-white/80 text-left space-y-4 mb-auto">
        {plan.features.map((feature) => (
          <li key={feature}>✓ {feature}</li>
        ))}
      </ul>

      <div className="mt-8">
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
                Meditate & Accrue Points Now
              </>
            ) : (
              account ? "Get Started" : "Sign In"
            )}
          </Button>
        ) : (
          <TokenBuyButton />
        )}
      </div>
    </motion.div>
  );
};
