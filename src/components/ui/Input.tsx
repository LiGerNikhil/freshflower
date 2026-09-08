import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-ink/10 bg-white/70 px-4 py-3 text-[15px] text-ink",
          "placeholder:text-ink-soft/60",
          "focus:outline-none focus:ring-2 focus:ring-gold/60 focus:border-transparent",
          "transition-shadow duration-150",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
