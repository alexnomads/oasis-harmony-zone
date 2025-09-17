import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TokenRiskWarningDialog } from "./TokenRiskWarningDialog";
import pumpFunLogo from "@/assets/pump-fun-logo.png";

export const TokenBuyButton = () => {
  const [showWarning, setShowWarning] = useState(false);

  const handleBuyClick = () => {
    setShowWarning(true);
  };

  const handleProceed = () => {
    window.open("https://pump.fun/coin/EvGUSZsjvts61TxfUv21jF7gpmezxeQbvPpsQqt9pump", "_blank");
  };
  return (
    <>
      <div className="flex justify-center items-center w-full">
        <button 
          className="retro-button py-6 px-8 text-xl rounded-full glitch-text hover:opacity-90 transition-opacity" 
          onClick={handleBuyClick} 
          data-text="Buy $ROJ now on Pump Fun"
        >
          <div className="flex items-center gap-3">
            <span>Buy $ROJ now on Pump Fun</span>
          </div>
        </button>
      </div>
      
      <TokenRiskWarningDialog
        open={showWarning}
        onClose={() => setShowWarning(false)}
        onProceed={handleProceed}
      />
    </>
  );
};