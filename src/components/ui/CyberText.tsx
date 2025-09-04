import React from 'react';
import { cn } from '@/lib/utils';

interface CyberTextProps {
  children: React.ReactNode;
  variant?: 'heading' | 'subheading' | 'body' | 'mono';
  className?: string;
  glitch?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export const CyberText: React.FC<CyberTextProps> = ({ 
  children, 
  variant = 'body',
  className,
  glitch = false,
  as: Component = 'div'
}) => {
  const variantClasses = {
    heading: 'cyber-heading text-4xl md:text-6xl font-black',
    subheading: 'cyber-heading text-2xl md:text-4xl font-bold',
    body: 'retro-text text-base md:text-lg',
    mono: 'retro-text text-sm font-mono uppercase tracking-wider'
  };

  const glitchClass = glitch ? 'glitch-text' : '';
  
  return (
    <Component
      className={cn(variantClasses[variant], glitchClass, className)}
      data-text={glitch ? children : undefined}
    >
      {children}
    </Component>
  );
};