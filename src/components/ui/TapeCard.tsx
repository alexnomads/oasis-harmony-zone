import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TapeCardProps {
  children: React.ReactNode;
  className?: string;
}

export const TapeCard: React.FC<TapeCardProps> = ({ 
  children, 
  className, 
  ...props 
}) => {
  return (
    <Card
      className={cn('tape-card', className)}
      {...props}
    >
      {children}
    </Card>
  );
};