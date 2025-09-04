import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GlitchButtonProps extends ButtonProps {
  glitchText?: string;
}

export const GlitchButton: React.FC<GlitchButtonProps> = ({ 
  children, 
  className, 
  glitchText,
  ...props 
}) => {
  return (
    <Button
      className={cn(
        'retro-button',
        glitchText && 'glitch-text',
        className
      )}
      data-text={glitchText || children}
      {...props}
    >
      {children}
    </Button>
  );
};