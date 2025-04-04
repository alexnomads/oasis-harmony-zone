
import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useToast } from "@/components/ui/use-toast";
import { PlanCard } from "./subscription/PlanCard";
import { PlanHeader } from "./subscription/PlanHeader";
import { SubscriptionDialog } from "./subscription/SubscriptionDialog";
import { plans } from "@/data/subscriptionPlans";

export const SubscriptionPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<null | {
    title: string;
    price: number;
  }>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { account } = useWeb3();
  const { toast } = useToast();

  const handlePurchase = async () => {
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

  const handleSelectPlan = (title: string, price: number) => {
    setSelectedPlan({ title, price });
  };

  return (
    <section className="py-16 bg-gradient-to-br from-[#9C27B0] to-[#FF8A00]" id="subscription-plans">
      <div className="container mx-auto px-6">
        <PlanHeader isYearly={isYearly} setIsYearly={setIsYearly} />

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.title}
              plan={plan}
              isYearly={isYearly}
              index={index}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>
      </div>

      <SubscriptionDialog
        selectedPlan={selectedPlan}
        isYearly={isYearly}
        isProcessing={isProcessing}
        onOpenChange={(open) => !open && setSelectedPlan(null)}
        onConfirmPurchase={handlePurchase}
      />
    </section>
  );
};
