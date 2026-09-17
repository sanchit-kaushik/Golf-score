import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'sage' | 'gold' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const base = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase";
  
  const variants = {
    default: "bg-sand-100 text-charcoal border border-sand-200",
    sage: "bg-sage-50 text-sage-800 border border-sage-200",
    gold: "bg-gold-50 text-gold-700 border border-gold-200",
    outline: "bg-transparent text-charcoal-muted border border-charcoal/15",
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
