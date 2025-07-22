"use client"

import type * as React from "react"
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const loadingVariants = cva("flex flex-col items-center justify-center gap-4 p-6", {
  variants: {
    variant: {
      default: "text-foreground",
      success: "text-green-600 dark:text-green-400",
      error: "text-red-600 dark:text-red-400",
      warning: "text-yellow-600 dark:text-yellow-400",
    },
    size: {
      sm: "min-h-[120px] text-sm",
      md: "min-h-[200px] text-base",
      lg: "min-h-[300px] text-lg",
      xl: "min-h-[400px] text-xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

const iconVariants = cva("animate-spin", {
  variants: {
    size: {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface LoadingOverlayProps extends VariantProps<typeof loadingVariants> {
  isVisible: boolean
  title?: string
  description?: string
  progress?: number
  showProgress?: boolean
  icon?: React.ReactNode
  overlay?: boolean
  className?: string
  children?: React.ReactNode
}

export function LoadingOverlay({
  isVisible,
  title = "Cargando...",
  description,
  progress,
  showProgress = false,
  icon,
  overlay = true,
  variant = "default",
  size = "md",
  className,
  children,
}: LoadingOverlayProps) {
  if (!isVisible) return null

  const getIcon = () => {
    if (icon) return icon

    switch (variant) {
      case "success":
        return <CheckCircle className={cn(iconVariants({ size }), "animate-none")} />
      case "error":
        return <XCircle className={cn(iconVariants({ size }), "animate-none")} />
      case "warning":
        return <AlertCircle className={cn(iconVariants({ size }), "animate-none")} />
      default:
        return <Loader2 className={iconVariants({ size })} />
    }
  }

  const content = (
    <div className={cn(loadingVariants({ variant, size }), className)}>
      {getIcon()}

      <div className="text-center space-y-2">
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-muted-foreground text-sm max-w-md">{description}</p>}
      </div>

      {showProgress && typeof progress === "number" && (
        <div className="w-full max-w-xs space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}% completado</p>
        </div>
      )}

      {children}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Card className="border-2">
            <CardContent className="p-0">{content}</CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  )
}
