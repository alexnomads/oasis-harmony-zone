import { Button } from "@/components/ui/button";
import { useState } from "react";

export const LifeBuyButton = () => {
  const [isDisabled] = useState(true); // Will be enabled when link is provided

  const handleBuyClick = () => {
    // Placeholder - will be updated with actual link
    console.log("$LIFE token link will be added soon");
  };

  return (
    <div className="flex justify-center items-center w-full">
      <button 
        className={`retro-button py-6 px-8 text-xl rounded-full glitch-text transition-opacity ${
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
        }`}
        onClick={handleBuyClick} 
        disabled={isDisabled}
        data-text="Buy $LIFE now on Pump Fun"
      >
        <div className="flex items-center gap-3">
          <span>Buy $LIFE now on Pump Fun</span>
        </div>
      </button>
    </div>
  );
};