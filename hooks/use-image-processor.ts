"use client"

import { useState, useCallback } from "react"
import { processImage, validateImageFile, IMAGE_PRESETS } from "@/lib/image-utils"
import type { ImageProcessingOptions, ProcessedImage } from "@/lib/image-utils.ts"

interface UseImageProcessorOptions {
  preset?: keyof typeof IMAGE_PRESETS
  customOptions?: Partial<ImageProcessingOptions>
  onProgress?: (progress: number) => void
  onError?: (error: string) => void
}

export function useImageProcessor(options: UseImageProcessorOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const processImages = useCallback(
    async (files: File[]): Promise<ProcessedImage[]> => {
      setIsProcessing(true)
      setProgress(0)

      const results: ProcessedImage[] = []
      const processingOptions: ImageProcessingOptions = {
        ...(options.preset ? IMAGE_PRESETS[options.preset] : IMAGE_PRESETS.woocommerce),
        ...options.customOptions,
      }

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]

          // Validar archivo
          const validation = validateImageFile(file)
          if (!validation.isValid) {
            options.onError?.(validation.error || "Archivo no válido")
            continue
          }

          // Actualizar progreso
          const currentProgress = ((i + 0.5) / files.length) * 100
          setProgress(currentProgress)
          options.onProgress?.(currentProgress)

          // Procesar imagen
          const processedImage = await processImage(file, processingOptions)
          results.push(processedImage)

          // Actualizar progreso completado
          const completedProgress = ((i + 1) / files.length) * 100
          setProgress(completedProgress)
          options.onProgress?.(completedProgress)
        }

        return results
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al procesar las imágenes"
        options.onError?.(errorMessage)
        throw error
      } finally {
        setIsProcessing(false)
        setProgress(0)
      }
    },
    [options],
  )

  const processSingleImage = useCallback(
    async (file: File): Promise<ProcessedImage> => {
      const results = await processImages([file])
      return results[0]
    },
    [processImages],
  )

  const processImageFromDataUrl = useCallback(
    async (dataUrl: string): Promise<ProcessedImage> => {
      setIsProcessing(true)

      const processingOptions: ImageProcessingOptions = {
        ...(options.preset ? IMAGE_PRESETS[options.preset] : IMAGE_PRESETS.woocommerce),
        ...options.customOptions,
      }

      try {
        const result = await processImage(dataUrl, processingOptions)
        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al procesar la imagen"
        options.onError?.(errorMessage)
        throw error
      } finally {
        setIsProcessing(false)
      }
    },
    [options],
  )

  return {
    processImages,
    processSingleImage,
    processImageFromDataUrl,
    isProcessing,
    progress,
  }
}
