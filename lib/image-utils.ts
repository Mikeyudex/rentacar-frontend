// Configuraciones predefinidas para diferentes usos
export const IMAGE_PRESETS = {
  woocommerce: {
    width: 800,
    height: 800,
    quality: 0.85,
    format: "image/jpeg" as const,
  },
  thumbnail: {
    width: 300,
    height: 200,
    quality: 0.8,
    format: "image/jpeg" as const,
  },
  gallery: {
    width: 1200,
    height: 800,
    quality: 0.9,
    format: "image/jpeg" as const,
  },
  preview: {
    width: 150,
    height: 100,
    quality: 0.7,
    format: "image/jpeg" as const,
  },
} as const

export interface ImageProcessingOptions {
  width: number
  height: number
  quality: number
  format: "image/jpeg" | "image/png" | "image/webp"
  maintainAspectRatio?: boolean
  backgroundColor?: string
}

export interface ProcessedImage {
  dataUrl: string
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dimensions: {
    width: number
    height: number
  }
}

/**
 * Redimensiona y comprime una imagen
 */
export async function processImage(file: File | string, options: ImageProcessingOptions): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto del canvas"))
          return
        }

        // Calcular dimensiones manteniendo aspect ratio si está habilitado
        const { width: targetWidth, height: targetHeight } = calculateDimensions(
          img.width,
          img.height,
          options.width,
          options.height,
          options.maintainAspectRatio ?? true,
        )

        canvas.width = targetWidth
        canvas.height = targetHeight

        // Configurar el contexto para mejor calidad
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"

        // Fondo si es necesario (para JPEGs)
        if (options.format === "image/jpeg" && options.backgroundColor) {
          ctx.fillStyle = options.backgroundColor
          ctx.fillRect(0, 0, targetWidth, targetHeight)
        }

        // Dibujar la imagen redimensionada
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al procesar la imagen"))
              return
            }

            const dataUrl = canvas.toDataURL(options.format, options.quality)
            const originalSize = typeof file === "string" ? 0 : file.size
            const compressedSize = blob.size
            const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0

            resolve({
              dataUrl,
              blob,
              originalSize,
              compressedSize,
              compressionRatio,
              dimensions: {
                width: targetWidth,
                height: targetHeight,
              },
            })
          },
          options.format,
          options.quality,
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen"))
    }

    // Cargar la imagen
    if (typeof file === "string") {
      img.src = file
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error("Error al leer el archivo"))
      reader.readAsDataURL(file)
    }
  })
}

/**
 * Calcula las dimensiones manteniendo el aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
  maintainAspectRatio: boolean,
): { width: number; height: number } {
  if (!maintainAspectRatio) {
    return { width: targetWidth, height: targetHeight }
  }

  const aspectRatio = originalWidth / originalHeight
  const targetAspectRatio = targetWidth / targetHeight

  let width: number
  let height: number

  if (aspectRatio > targetAspectRatio) {
    // La imagen es más ancha, ajustar por ancho
    width = targetWidth
    height = Math.round(targetWidth / aspectRatio)
  } else {
    // La imagen es más alta, ajustar por alto
    height = targetHeight
    width = Math.round(targetHeight * aspectRatio)
  }

  return { width, height }
}

/**
 * Convierte bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Valida si un archivo es una imagen válida
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Tipo de archivo no válido. Solo se permiten JPEG, PNG y WebP.",
    }
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "El archivo es demasiado grande. Máximo 10MB.",
    }
  }

  return { isValid: true }
}
