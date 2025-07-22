"use client"

import { useState, useCallback } from "react"

interface LoadingState {
  isLoading: boolean
  title?: string
  description?: string
  progress?: number
  variant?: "default" | "success" | "error" | "warning"
}

interface UseLoadingOptions {
  defaultTitle?: string
  defaultDescription?: string
  autoHide?: boolean
  autoHideDelay?: number
}

export function useLoading(options: UseLoadingOptions = {}) {
  const { defaultTitle = "Cargando...", defaultDescription, autoHide = false, autoHideDelay = 2000 } = options

  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    title: defaultTitle,
    description: defaultDescription,
    progress: undefined,
    variant: "default",
  })

  const showLoading = useCallback(
    (config?: Partial<LoadingState>) => {
      setLoadingState({
        isLoading: true,
        title: config?.title || defaultTitle,
        description: config?.description || defaultDescription,
        progress: config?.progress,
        variant: config?.variant || "default",
      })
    },
    [defaultTitle, defaultDescription],
  )

  const hideLoading = useCallback(() => {
    setLoadingState((prev) => ({ ...prev, isLoading: false }))
  }, [])

  const updateProgress = useCallback((progress: number) => {
    setLoadingState((prev) => ({ ...prev, progress }))
  }, [])

  const showSuccess = useCallback(
    (title = "¡Éxito!", description?: string) => {
      setLoadingState({
        isLoading: true,
        title,
        description,
        variant: "success",
      })

      if (autoHide) {
        setTimeout(hideLoading, autoHideDelay)
      }
    },
    [autoHide, autoHideDelay, hideLoading],
  )

  const showError = useCallback(
    (title = "Error", description?: string) => {
      setLoadingState({
        isLoading: true,
        title,
        description,
        variant: "error",
      })

      if (autoHide) {
        setTimeout(hideLoading, autoHideDelay)
      }
    },
    [autoHide, autoHideDelay, hideLoading],
  )

  const showWarning = useCallback(
    (title = "Advertencia", description?: string) => {
      setLoadingState({
        isLoading: true,
        title,
        description,
        variant: "warning",
      })

      if (autoHide) {
        setTimeout(hideLoading, autoHideDelay)
      }
    },
    [autoHide, autoHideDelay, hideLoading],
  )

  return {
    ...loadingState,
    showLoading,
    hideLoading,
    updateProgress,
    showSuccess,
    showError,
    showWarning,
  }
}
