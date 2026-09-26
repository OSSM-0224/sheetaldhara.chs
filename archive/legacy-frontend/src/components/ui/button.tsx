import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] border-2 border-border font-bold uppercase tracking-wider",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-red-700 shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px] border-2 border-border font-bold uppercase tracking-wider",
        outline:
          "border-2 border-border bg-card hover:bg-secondary text-foreground font-bold uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] active:translate-x-[1px] active:translate-y-[1px]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-muted border border-border font-medium",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        subtle: "bg-muted text-muted-foreground hover:bg-secondary border border-border",
      },
      size: {
        default: "h-10 px-4 py-2 text-xs",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-6 text-sm font-bold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
