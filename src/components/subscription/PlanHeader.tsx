
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

interface PlanHeaderProps {
  isYearly: boolean;
  setIsYearly: (value: boolean) => void;
}

export const PlanHeader = ({ isYearly, setIsYearly }: PlanHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <h2 className="text-4xl font-bold text-white mb-4">Subscription Plans</h2>
      <p className="text-white/80 max-w-2xl mx-auto mb-8">
        Choose the perfect plan to unlock enhanced AI features and analytics
      </p>
      <div className="flex items-center justify-center gap-2">
        <span className="text-white/80">Monthly</span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="data-[state=checked]:bg-softOrange"
        />
        <span className="text-white/80">Yearly (20% off)</span>
      </div>
    </motion.div>
  );
};
