import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer hover:cursor-pointer";
    
    const variants = {
      primary: "bg-ocean-primary text-white hover:bg-ocean-deep focus:ring-ocean-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
      secondary: "bg-ocean-secondary text-white hover:bg-ocean-accent focus:ring-ocean-secondary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
      outline: "border-2 border-ocean-primary text-ocean-primary hover:bg-ocean-primary hover:text-white focus:ring-ocean-primary"
    };
    
    const sizes = {
      sm: "px-4 py-2 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg"
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
