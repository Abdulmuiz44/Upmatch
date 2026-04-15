import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-xl border border-border/85 bg-white/95 px-4 py-3 text-sm leading-6 shadow-sm outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/90 focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-primary/10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";

export { Textarea };
