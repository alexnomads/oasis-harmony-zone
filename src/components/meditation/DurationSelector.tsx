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
  isRunning
}: DurationSelectorProps) => {
  const durations: DurationOption[] = [{
    label: '30 sec',
    value: 30
  }, {
    label: '1 min',
    value: 60
  }, {
    label: '5 min',
    value: 300
  }, {
    label: '10 min',
    value: 600
  }, {
    label: '15 min',
    value: 900
  }, {
    label: '30 min',
    value: 1800
  }];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }} 
      className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
    >
      {durations.map(({ label, value }) => (
        <motion.div 
          key={value} 
          whileHover={{ scale: isRunning ? 1 : 1.05 }} 
          whileTap={{ scale: isRunning ? 1 : 0.95 }}
        >
          <Button
            variant={selectedDuration === value ? "default" : "outline"}
            onClick={() => setSelectedDuration(value)}
            disabled={isRunning}
            className={`w-full h-16 md:h-20 text-base md:text-lg font-medium rounded-xl ${
              selectedDuration === value 
                ? 'retro-button text-xl md:text-2xl' 
                : 'retro-button opacity-60 hover:opacity-100'
            }`}
          >
            {label}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};