
import { Button } from "@/components/ui/button";

export const TokenBuyButton = () => {
  return (
    <div className="flex justify-center items-center w-full">
      <Button
        className="bg-gradient-to-r from-[#9C27B0] to-[#FF8A00] hover:opacity-90 text-white py-6 px-8 text-xl rounded-full opacity-80 cursor-not-allowed"
        disabled={true}
      >
        COMING SOON
      </Button>
    </div>
  );
};
