
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Please enter a valid amount",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export const TokenBuyButton = () => {
  const { account, connectWallet } = useWeb3();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "100",
    },
  });

  const handleBuyToken = async (values: FormValues) => {
    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to buy ROJ tokens",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // This would be replaced with actual token purchase logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating transaction
      
      toast({
        title: "Purchase Successful",
        description: `You have successfully purchased ${values.amount} ROJ tokens!`,
      });
      
      setIsOpen(false);
    } catch (error) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: "There was an error processing your purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-gradient-to-r from-[#9C27B0] to-[#FF8A00] hover:opacity-90 text-white py-6 px-8 text-xl rounded-full"
          onClick={(e) => {
            if (!account) {
              e.preventDefault();
              connectWallet();
            }
          }}
        >
          {account ? "Buy $ROJ Tokens" : "Connect Wallet to Buy"}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Buy ROJ Tokens</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Enter the amount of $ROJ tokens you want to purchase.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleBuyToken)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        placeholder="100"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                        $ROJ
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="bg-zinc-800 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Price per token</span>
                <span className="text-white">$0.20</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-zinc-400">Network fee</span>
                <span className="text-white">~$5.00</span>
              </div>
              <div className="border-t border-zinc-700 my-2 pt-2 flex justify-between">
                <span className="text-zinc-400">Total cost</span>
                <span className="text-white font-bold">
                  ${(Number(form.watch("amount")) * 0.2 + 5).toFixed(2)}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#9C27B0] to-[#FF8A00]"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm Purchase"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
