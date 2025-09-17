import React, { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, ArrowDown } from 'lucide-react';

interface TokenRiskWarningDialogProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export const TokenRiskWarningDialog: React.FC<TokenRiskWarningDialogProps> = ({
  open,
  onClose,
  onProceed,
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleProceed = () => {
    onClose();
    onProceed();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            WARNING: HIGH-RISK INVESTMENT - READ CAREFULLY
          </DialogTitle>
          <DialogDescription>
            Please read and understand these risks before proceeding
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea ref={scrollAreaRef} className="h-96 w-full rounded-md border p-4">
          <div className="space-y-4 text-sm">
            <div>
              <strong>1. SPECULATIVE NATURE:</strong> This token is a highly speculative investment with an extremely high risk of loss. Most tokens listed on PumpFun fail and become worthless. You may lose 100% of your investment.
            </div>
            
            <div>
              <strong>2. NO GUARANTEES:</strong> There are absolutely no guarantees of profits, returns, or even the preservation of capital. Past performance is not indicative of future results.
            </div>
            
            <div>
              <strong>3. SECURITIES RISK:</strong> This token may be deemed an unregistered security by the U.S. Securities and Exchange Commission (SEC) or other regulatory bodies. Purchasing this token may violate securities laws in your jurisdiction.
            </div>
            
            <div>
              <strong>4. NOT FINANCIAL ADVICE:</strong> This is not financial, investment, legal, or tax advice. You are solely responsible for your investment decisions. Consult with a licensed professional before making any investment.
            </div>
            
            <div>
              <strong>5. VOLATILITY WARNING:</strong> Tokens on PumpFun experience extreme price volatility. Prices can drop 90%+ within minutes. Liquidity can disappear instantly.
            </div>
            
            <div>
              <strong>6. SMART CONTRACT RISK:</strong> This token operates on smart contracts which may contain bugs or vulnerabilities. You could lose your entire investment due to technical issues.
            </div>
            
            <div>
              <strong>7. LIQUIDITY RISK:</strong> There is no guarantee you will be able to sell your tokens. Many PumpFun tokens experience "rug pulls" where liquidity is removed, making tokens impossible to sell.
            </div>
            
            <div>
              <strong>8. JURISDICTIONAL RESTRICTIONS:</strong> This token may not be available for purchase in your country. It is your responsibility to determine if purchasing this token complies with local laws.
            </div>
            
            <div>
              <strong>9. NO PROFESSIONAL REVIEW:</strong> This token has not been reviewed by any financial professionals, regulatory bodies, or securities experts.
            </div>
            
            <div>
              <strong>10. MINIMUM AGE:</strong> You must be of legal age in your jurisdiction to purchase this token (typically 18+).
            </div>
            
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="font-semibold text-destructive">
                By proceeding, you acknowledge that you have read and understood these risks, and you are solely responsible for any losses incurred. This token is suitable only for investors who can afford to lose their entire investment.
              </p>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <Button
            variant="outline"
            onClick={scrollToBottom}
            className="flex items-center gap-2"
          >
            <ArrowDown className="h-4 w-4" />
            Scroll Down
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleProceed}>
              I Understand - Proceed to Pump Fun
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};