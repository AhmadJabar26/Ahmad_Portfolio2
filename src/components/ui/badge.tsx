import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-indigo-600 text-white hover:bg-indigo-500",
        secondary:
          "border-transparent bg-zinc-800 text-zinc-300 hover:bg-zinc-700",
        destructive:
          "border-transparent bg-red-600 text-white hover:bg-red-500",
        outline: "text-zinc-300 border-white/10 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps {
  key?: string | number;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline" | null;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant: variant || "default" }), className)} {...props}>
      {children}
    </div>
  );
}
