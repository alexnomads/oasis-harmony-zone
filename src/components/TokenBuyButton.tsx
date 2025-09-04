
import { Button } from "@/components/ui/button";

export const TokenBuyButton = () => {
  return (
    <div className="flex justify-center items-center w-full">
      <button
        className="retro-button py-6 px-8 text-xl rounded-full opacity-80 cursor-not-allowed glitch-text"
        disabled={true}
        data-text="COMING SOON"
      >
        COMING SOON
      </button>
    </div>
  );
};
