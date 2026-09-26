import * as React from "react";
import { cn } from "../../lib/utils.ts";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1.5px] w-full" : "h-full w-[1.5px]",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

export { Separator };
