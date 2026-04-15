import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl border text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-primary-foreground shadow-sm hover:border-primary/95 hover:bg-primary/95",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/90",
        outline:
          "border-border/90 bg-white/90 text-foreground hover:border-primary/25 hover:bg-white",
        ghost: "border-transparent bg-transparent text-foreground hover:bg-secondary/80",
        destructive:
          "border-danger bg-danger text-danger-foreground hover:bg-danger/90 hover:border-danger/90"
      },
      size: {
        default: "h-11 px-4 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-[13px]",
        lg: "h-12 px-5 text-[15px]"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button, buttonVariants };
