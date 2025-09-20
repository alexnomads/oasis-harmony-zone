import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const TokenBuyButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetFitClick = () => {
    if (user) {
      navigate('/meditate');
    } else {
      navigate('/?login=true');
    }
  };
  return (
    <>
      <div className="flex justify-center items-center w-full gap-4 flex-wrap">
        <button 
          className="retro-button py-6 px-8 text-xl rounded-full glitch-text hover:opacity-90 transition-opacity" 
          onClick={handleGetFitClick} 
          data-text="Get Fit & Accrue Points Now"
        >
          <div className="flex items-center gap-3">
            <span>Get Fit & Accrue Points Now</span>
          </div>
        </button>
        
        <button 
          className="retro-button py-6 px-8 text-xl rounded-full opacity-60 cursor-not-allowed" 
          disabled
        >
          <div className="flex items-center gap-3">
            <span>$WELLNESS - Coming Soon</span>
          </div>
        </button>
      </div>
    </>
  );
};