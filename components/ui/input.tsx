import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-border/85 bg-white/95 px-4 py-3 text-sm shadow-sm outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/90 focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-primary/10",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
