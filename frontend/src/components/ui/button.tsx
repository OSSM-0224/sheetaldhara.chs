import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5E3B] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg active:scale-[0.98] transition-transform select-none';

    const variantClasses = {
      primary: 'bg-[#2C5E3B] text-white hover:bg-[#234A2F] shadow-sm',
      secondary: 'bg-[#EAE4D7] text-[#111111] hover:bg-[#E0D8C8] border border-[#DDD5C5]',
      danger: 'bg-[#B93826] text-white hover:bg-[#9E2E1F] shadow-sm',
      outline: 'border border-[#DDD5C5] bg-white text-[#111111] hover:bg-[#F9F7F2]',
      ghost: 'bg-transparent text-[#111111] hover:bg-[#EAE4D7]/50',
    };

    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2 h-10',
      lg: 'text-base px-6 py-3 h-12',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
