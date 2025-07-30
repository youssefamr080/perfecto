import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-sm font-extrabold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-soft bg-accent text-black",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-black hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-black hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-black hover:bg-destructive/80",
        outline: "text-black border-black/10 bg-white/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
