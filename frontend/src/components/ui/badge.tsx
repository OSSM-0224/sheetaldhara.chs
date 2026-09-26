import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'resident' | 'visitor' | 'success' | 'danger' | 'outline';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#EAE4D7] text-[#111111] border-[#DDD5C5]',
    resident: 'bg-[#EBF3ED] text-[#2C5E3B] border-[#C3DCB9]',
    visitor: 'bg-[#FFF4E5] text-[#B95D00] border-[#FFE0B2]',
    success: 'bg-[#EBF3ED] text-[#2C5E3B] border-[#C3DCB9]',
    danger: 'bg-[#FBEBEA] text-[#B93826] border-[#F2C1BD]',
    outline: 'bg-transparent text-[#555555] border-[#DDD5C5]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
