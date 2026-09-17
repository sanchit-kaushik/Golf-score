import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 disabled:opacity-50 disabled:pointer-events-none rounded-full cursor-pointer";
    
    const variants = {
      primary: "bg-charcoal text-white hover:bg-charcoal-deep shadow-subtle hover:shadow-card hover:-translate-y-0.5 active:translate-y-0",
      secondary: "bg-sage-600 text-white hover:bg-sage-700 shadow-subtle hover:shadow-card hover:-translate-y-0.5 active:translate-y-0",
      outline: "border border-charcoal/20 bg-transparent text-charcoal hover:bg-charcoal/5 hover:border-charcoal/40 active:bg-charcoal/10",
      ghost: "text-charcoal-muted hover:text-charcoal hover:bg-sand-100/50",
      gold: "bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-card hover:shadow-gold-glow hover:-translate-y-0.5 active:translate-y-0",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs tracking-wider uppercase font-semibold",
      md: "h-11 px-6 text-sm tracking-wider uppercase font-semibold",
      lg: "h-13 px-8 text-sm sm:text-base tracking-wider uppercase font-bold py-3.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
