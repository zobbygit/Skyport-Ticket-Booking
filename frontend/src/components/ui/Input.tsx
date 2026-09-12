import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-textMuted",
        "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
