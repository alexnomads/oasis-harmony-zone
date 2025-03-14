
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SubscriptionDialogProps {
  selectedPlan: { title: string; price: number } | null;
  isYearly: boolean;
  isProcessing: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmPurchase: () => void;
}

export const SubscriptionDialog = ({
  selectedPlan,
  isYearly,
  isProcessing,
  onOpenChange,
  onConfirmPurchase,
}: SubscriptionDialogProps) => {
  return (
    <Dialog open={!!selectedPlan} onOpenChange={onOpenChange}>
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
            onClick={onConfirmPurchase}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
