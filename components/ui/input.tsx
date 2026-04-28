import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#ddd3c7] bg-white px-4 py-2 text-sm text-[#1d2a43] shadow-sm outline-none transition placeholder:text-[#9aa2b2] focus-visible:ring-2 focus-visible:ring-[#d56d3b]/35 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
