import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-[#e2d7ca] bg-[#f7f2eb] text-[#1d2a43]",
        success: "border-[#ccead7] bg-[#e9f8ee] text-[#166534]",
        warning: "border-[#f0d7bf] bg-[#fff2e6] text-[#b45309]",
        dark: "border-transparent bg-[#24324d] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
