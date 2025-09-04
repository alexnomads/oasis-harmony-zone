
import { useState } from "react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useToast } from "@/components/ui/use-toast";
import { PlanCard } from "./subscription/PlanCard";
import { PlanHeader } from "./subscription/PlanHeader";
import { SubscriptionDialog } from "./subscription/SubscriptionDialog";
import { plans } from "@/data/subscriptionPlans";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const SubscriptionPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<null | {
    title: string;
    price: number;
  }>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { account } = useWeb3();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    <section className="py-16 relative overflow-hidden" id="subscription-plans">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-accent/15 to-secondary/30"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_65%,hsl(var(--deep-violet))_0%,transparent_50%),radial-gradient(circle_at_65%_35%,hsl(var(--neon-magenta))_0%,transparent_50%),radial-gradient(circle_at_50%_80%,hsl(var(--electric-cyan))_0%,transparent_45%)]"></div>
      <div className="container mx-auto px-6 relative z-10">
        <PlanHeader isYearly={isYearly} setIsYearly={setIsYearly} />

        {isMobile ? (
          <Carousel className="w-full max-w-sm mx-auto" opts={{ align: "center" }}>
            <CarouselContent>
              {plans.map((plan, index) => (
                <CarouselItem key={plan.title}>
                  <PlanCard
                    plan={plan}
                    isYearly={isYearly}
                    index={index}
                    onSelectPlan={handleSelectPlan}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white border-white/20 hover:bg-white/10" />
            <CarouselNext className="text-white border-white/20 hover:bg-white/10" />
          </Carousel>
        ) : (
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
        )}
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
