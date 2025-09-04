import React from 'react';
import { cn } from '@/lib/utils';

interface NeonFrameProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export const NeonFrame: React.FC<NeonFrameProps> = ({ 
  children, 
  className, 
  intensity = 'medium' 
}) => {
  const intensityClasses = {
    low: 'crt-frame opacity-70',
    medium: 'crt-frame',
    high: 'crt-frame shadow-[0_0_40px_hsl(var(--primary)/0.8)]'
  };

  return (
    <div className={cn(intensityClasses[intensity], 'p-6', className)}>
      {children}
    </div>
  );
};