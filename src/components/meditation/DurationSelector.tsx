
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface DurationOption {
  label: string;
  value: number;
}

interface DurationSelectorProps {
  selectedDuration: number;
  setSelectedDuration: (duration: number) => void;
  isRunning: boolean;
}

export const DurationSelector = ({
  selectedDuration,
  setSelectedDuration,
  isRunning,
}: DurationSelectorProps) => {
  const durations: DurationOption[] = [
    { label: '30 sec', value: 30 },
    { label: '1 min', value: 60 },
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-3 gap-3 max-w-lg mx-auto"
    >
      {durations.map(({ label, value }) => (
        <motion.div
          key={value}
          whileHover={{ scale: isRunning ? 1 : 1.05 }}
          whileTap={{ scale: isRunning ? 1 : 0.95 }}
        >
          <Button
            variant={selectedDuration === value ? "default" : "outline"}
            className={`w-full transition-all duration-200 ${selectedDuration === value 
              ? 'bg-gradient-to-r from-vibrantPurple to-vibrantOrange border-none text-white hover:opacity-90 shadow-lg' 
              : 'bg-white/5 border-zinc-700 hover:bg-white/10 text-white'}`}
            onClick={() => {
              if (!isRunning) {
                setSelectedDuration(value);
              }
            }}
            disabled={isRunning}
          >
            {label}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};
