"use client"
import { Loader2 } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-muted-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      success: "text-green-600",
      warning: "text-yellow-600",
      error: "text-red-600",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
})

interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string
}

export function LoadingSpinner({ size, variant, className }: LoadingSpinnerProps) {
  return <Loader2 className={cn(spinnerVariants({ size, variant }), className)} />
}
