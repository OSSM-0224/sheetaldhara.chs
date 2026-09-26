import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-border bg-primary text-primary-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-destructive bg-destructive/10 text-destructive",
        outline: "text-foreground border-border bg-card",
        success: "border-[#1E5E3A] bg-[#E8F3ED] text-[#1E5E3A]",
        warning: "border-[#92400E] bg-[#FEF3C7] text-[#92400E]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants> & {
    className?: string;
    children?: React.ReactNode;
  };

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
