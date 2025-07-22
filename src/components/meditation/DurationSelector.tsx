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
    label: '5 min',
    value: 300
  }, {
    label: '10 min',
    value: 600
  }, {
    label: '15 min',
    value: 900
  }];
  return <motion.div initial={{
    opacity: 0,
    y: 20
  }} animate={{
    opacity: 1,
    y: 0
  }} transition={{
    duration: 0.5
  }} className="grid grid-cols-4 gap-2">
      {durations.map(({
      label,
      value
    }) => <motion.div key={value} whileHover={{
      scale: isRunning ? 1 : 1.05
    }} whileTap={{
      scale: isRunning ? 1 : 0.95
    }}>
          
        </motion.div>)}
    </motion.div>;
};