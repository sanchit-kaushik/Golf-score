import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-sand-200/80 p-6 md:p-8 shadow-card transition-all duration-300",
        hoverEffect && "hover:shadow-elevated hover:border-sage-300 hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
