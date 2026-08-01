import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-cta text-primary-foreground hover:bg-primary-cta/80 shadow-[0_1px_4px_rgba(0,0,0,0.1)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        glass: "border-white/10 bg-white/5 text-zinc-100 backdrop-blur-md shadow-sm",
        premium: "border-primary/20 bg-primary/10 text-primary-foreground shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]",
        // Legacy compatibility
        success: "border-transparent bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        warning: "border-transparent bg-amber-500/10 text-amber-500 border-amber-500/20",
        danger: "border-transparent bg-rose-500/10 text-rose-500 border-rose-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge }
