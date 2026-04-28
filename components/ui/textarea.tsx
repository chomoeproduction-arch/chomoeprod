import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border border-[#ddd3c7] bg-white px-4 py-3 text-sm text-[#1d2a43] shadow-sm outline-none transition placeholder:text-[#9aa2b2] focus-visible:ring-2 focus-visible:ring-[#d56d3b]/35 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
