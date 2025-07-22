"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Camera, Plus, Upload, Loader2, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useImageProcessor } from "@/hooks/use-image-processor"
import { formatFileSize, IMAGE_PRESETS } from "@/lib/image-utils"
import type { ImageProcessingOptions } from "@/lib/image-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ImageUploadProps {
  onImageCapture: (imageUrl: string) => void
  preset?: keyof typeof IMAGE_PRESETS
  customOptions?: Partial<ImageProcessingOptions>
  showCompressionInfo?: boolean
}

export function ImageUpload({
  onImageCapture,
  preset = "woocommerce",
  customOptions,
  showCompressionInfo = true,
}: ImageUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: number
    compressedSize: number
    compressionRatio: number
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>("")
  const [cameraError, setCameraError] = useState<string>("")

  const { toast } = useToast()

  const { processSingleImage, processImageFromDataUrl, isProcessing, progress } = useImageProcessor({
    preset,
    customOptions,
    onError: (error) => {
      toast({
        title: "Error al procesar imagen",
        description: error,
        variant: "destructive",
      })
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const processedImage = await processSingleImage(file)

        // Mostrar información de compresión
        if (showCompressionInfo) {
          setCompressionInfo({
            originalSize: processedImage.originalSize,
            compressedSize: processedImage.compressedSize,
            compressionRatio: processedImage.compressionRatio,
          })

          toast({
            title: "Imagen procesada",
            description: `Tamaño reducido en ${processedImage.compressionRatio.toFixed(1)}% (${formatFileSize(
              processedImage.originalSize,
            )} → ${formatFileSize(processedImage.compressedSize)})`,
          })
        }

        onImageCapture(processedImage.dataUrl)
        setIsDialogOpen(false)
      } catch (error) {
        // El error ya se maneja en el hook
      }
    }
  }

  const startCamera = async () => {
    console.log("=== INICIO startCamera ===")

    try {
      // Verificaciones básicas
      if (!navigator) {
        throw new Error("Navigator no disponible")
      }

      if (!navigator.mediaDevices) {
        throw new Error("MediaDevices no disponible")
      }

      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia no disponible")
      }

      console.log("✅ APIs básicas disponibles")

      setCameraError("")

      // Detener stream anterior si existe
      if (stream) {
        console.log("Deteniendo stream anterior...")
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }

      // Reemplazar esta sección:
      // Configuración simple inicial
      // const basicConstraints: MediaStreamConstraints = {
      //   video: {
      //     width: { ideal: 1280, min: 640 },
      //     height: { ideal: 720, min: 480 },
      //     facingMode: { ideal: "environment" },
      //   },
      // }

      // Con esta nueva lógica más flexible:
      console.log("Intentando con constraints flexibles...")

      // Intentar con diferentes niveles de constraints
      const constraintOptions = [
        // Opción 1: Constraints básicas sin facingMode
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        // Opción 2: Solo dimensiones ideales más bajas
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        },
        // Opción 3: Completamente básico
        {
          video: true,
        },
      ]

      let mediaStream: MediaStream | null = null
      let lastError: any = null

      // Intentar cada opción hasta que una funcione
      for (let i = 0; i < constraintOptions.length; i++) {
        try {
          console.log(`Intentando opción ${i + 1}:`, constraintOptions[i])
          mediaStream = await navigator.mediaDevices.getUserMedia(constraintOptions[i])
          console.log(`✅ Éxito con opción ${i + 1}`)
          break
        } catch (err) {
          console.log(`❌ Falló opción ${i + 1}:`, err)
          lastError = err
          continue
        }
      }

      if (!mediaStream) {
        throw lastError || new Error("No se pudo obtener acceso a la cámara con ninguna configuración")
      }

      const basicConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: { ideal: "environment" },
        },
      }

      console.log("Solicitando acceso a cámara con constraints:", basicConstraints)

      // Obtener stream
      const mediaStream2 = await navigator.mediaDevices.getUserMedia(basicConstraints)

      console.log("✅ Stream obtenido exitosamente")

      if (!mediaStream2) {
        throw new Error("Stream es null o undefined")
      }

      const tracks = mediaStream2.getVideoTracks()
      console.log("Tracks de video encontrados:", tracks.length)

      if (tracks.length === 0) {
        throw new Error("No se encontraron tracks de video")
      }

      setStream(mediaStream2)
      console.log("✅ Stream guardado en estado")

      // Verificar referencia de video
      if (!videoRef.current) {
        throw new Error("Referencia de video no disponible")
      }

      console.log("✅ Referencia de video disponible")

      // Asignar stream al video
      videoRef.current.srcObject = mediaStream2
      console.log("✅ Stream asignado al elemento video")

      // Marcar como activo
      setIsCameraActive(true)
      console.log("✅ Cámara marcada como activa")

      // Obtener dispositivos después del éxito
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((device) => device.kind === "videoinput")
        console.log("Dispositivos de video encontrados:", videoDevices.length)
        setAvailableCameras(videoDevices)
      } catch (deviceError) {
        console.warn("No se pudieron enumerar dispositivos:", deviceError)
        // No es crítico, continuar
      }

      // Intentar reproducir
      try {
        if (videoRef.current) {
          await videoRef.current.play()
          console.log("✅ Video reproduciéndose")
        }
      } catch (playError) {
        console.warn("Advertencia al reproducir:", playError)
        // No es crítico si el stream funciona
      }

      console.log("=== FIN startCamera EXITOSO ===")
    } catch (error: any) {
      console.log("=== ERROR EN startCamera ===")
      console.error("Tipo de error:", typeof error)
      console.error("Error completo:", error)
      console.error("Error.name:", error?.name)
      console.error("Error.message:", error?.message)
      console.error("Error.stack:", error?.stack)

      // Limpiar estado
      setIsCameraActive(false)
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }

      // Determinar mensaje de error
      let errorMessage = "Error desconocido"

      if (error && typeof error === "object") {
        if ("message" in error && error.message) {
          errorMessage = String(error.message)
        } else if ("name" in error && error.name) {
          errorMessage = `Error: ${error.name}`
        } else {
          errorMessage = "Error de objeto sin mensaje"
        }
      } else if (typeof error === "string") {
        errorMessage = error
      } else {
        errorMessage = `Error de tipo: ${typeof error}`
      }

      console.error("Mensaje final de error:", errorMessage)

      setCameraError(errorMessage)

      toast({
        title: "Error de cámara",
        description: errorMessage,
        variant: "destructive",
      })

      console.log("=== FIN ERROR startCamera ===")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
      setIsCameraActive(false)
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Error",
        description: "Referencias de video o canvas no disponibles",
        variant: "destructive",
      })
      return
    }

    if (!isCameraActive || !stream) {
      toast({
        title: "Error",
        description: "La cámara no está activa",
        variant: "destructive",
      })
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Verificar que el video tenga datos
      if (video.readyState < 2) {
        toast({
          title: "Esperando...",
          description: "La cámara se está inicializando, intenta de nuevo",
          variant: "destructive",
        })
        return
      }

      // Obtener dimensiones reales del video
      const videoWidth = video.videoWidth || 640
      const videoHeight = video.videoHeight || 480

      console.log(`Capturando: ${videoWidth}x${videoHeight}`)

      // Configurar canvas
      canvas.width = videoWidth
      canvas.height = videoHeight

      const context = canvas.getContext("2d")
      if (!context) {
        throw new Error("No se pudo obtener el contexto del canvas")
      }

      // Dibujar imagen (sin efecto espejo en la captura)
      context.save()
      context.scale(-1, 1) // Mantener el efecto espejo
      context.drawImage(video, -videoWidth, 0, videoWidth, videoHeight)
      context.restore()

      // Convertir a imagen
      const imageUrl = canvas.toDataURL("image/jpeg", 0.95)

      if (imageUrl === "data:,") {
        throw new Error("No se pudo capturar la imagen del video")
      }

      // Procesar imagen
      const processedImage = await processImageFromDataUrl(imageUrl)

      if (showCompressionInfo) {
        setCompressionInfo({
          originalSize: processedImage.originalSize,
          compressedSize: processedImage.compressedSize,
          compressionRatio: processedImage.compressionRatio,
        })

        toast({
          title: "Foto capturada exitosamente",
          description: `Imagen optimizada: ${processedImage.dimensions.width}x${processedImage.dimensions.height}px`,
        })
      }

      onImageCapture(processedImage.dataUrl)
      stopCamera()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error al capturar:", error)
      const errorMessage = error instanceof Error ? error.message : "Error al capturar la foto"
      toast({
        title: "Error al capturar",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleDialogClose = () => {
    stopCamera()
    setIsDialogOpen(false)
  }

  const currentPreset = IMAGE_PRESETS[preset]

  const switchCamera = async (deviceId: string) => {
    setSelectedCameraId(deviceId)
    if (isCameraActive) {
      stopCamera()
      // Pequeño delay para asegurar que la cámara anterior se cierre
      setTimeout(() => {
        startCamera()
      }, 100)
    }
  }

  useEffect(() => {
    return () => {
      // Limpiar stream al desmontar el componente
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <>
      <Card className="cursor-pointer border-dashed" onClick={() => setIsDialogOpen(true)}>
        <CardContent className="flex flex-col items-center justify-center p-6 h-32">
          <Plus className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground text-center">Agregar foto</p>
          {showCompressionInfo && (
            <Badge variant="outline" className="mt-1 text-xs">
              {currentPreset.width}x{currentPreset.height}px
            </Badge>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Agregar imagen
              {showCompressionInfo && (
                <Badge variant="secondary" className="text-xs">
                  {currentPreset.width}x{currentPreset.height}px
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Procesando imagen...</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {isCameraActive ? (
            <div className="flex flex-col items-center space-y-4">
              {/* Selector de cámara */}
              {availableCameras.length > 1 && (
                <div className="w-full">
                  <Label htmlFor="camera-select" className="text-sm font-medium">
                    Seleccionar cámara:
                  </Label>
                  <Select value={selectedCameraId} onValueChange={switchCamera}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Seleccionar cámara" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCameras.map((camera, index) => (
                        <SelectItem key={camera.deviceId} value={camera.deviceId}>
                          {camera.label || `Cámara ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Previsualizador mejorado */}
              <div className="relative w-full max-w-md bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  autoPlay
                  playsInline
                  muted
                  style={{
                    transform: "scaleX(-1)",
                    minHeight: "240px",
                    maxHeight: "400px",
                    objectFit: "cover",
                  }}
                  onLoadedData={() => console.log("Video data loaded")}
                  onCanPlay={() => console.log("Video can play")}
                  onPlaying={() => console.log("Video is playing")}
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Overlays */}
                <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {currentPreset.width}x{currentPreset.height}px
                </div>

                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs">REC</span>
                </div>

                {/* Estado de la cámara */}
                {!isCameraActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Iniciando cámara...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error display */}
              {cameraError && (
                <div className="w-full p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">Error: {cameraError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setCameraError("")
                      startCamera()
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              )}

              {/* Controles */}
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={capturePhoto}
                  disabled={isProcessing || !!cameraError || !isCameraActive}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Camera className="h-5 w-5 mr-2" />
                      Capturar Foto
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={stopCamera} disabled={isProcessing} size="lg">
                  Cancelar
                </Button>
              </div>

              {/* Debug info */}
              <div className="text-center text-xs text-muted-foreground">
                Estado: {isCameraActive ? "Activa" : "Inactiva"} | Stream: {stream ? "Conectado" : "Desconectado"}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {showCompressionInfo && (
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p>Las imágenes se optimizarán automáticamente:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>
                          Redimensionadas a {currentPreset.width}x{currentPreset.height}px
                        </li>
                        <li>Comprimidas para reducir el tamaño</li>
                        <li>Optimizadas para tiendas online</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="flex flex-col h-24 items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                >
                  <Upload className="h-8 w-8 mb-2" />
                  <span>Subir imagen</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col h-24 items-center justify-center"
                  onClick={startCamera}
                  disabled={isProcessing}
                >
                  <Camera className="h-8 w-8 mb-2" />
                  <span>Usar cámara</span>
                </Button>
              </div>

              {compressionInfo && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Última imagen procesada:</strong>
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Tamaño reducido en {compressionInfo.compressionRatio.toFixed(1)}% (
                    {formatFileSize(compressionInfo.originalSize)} → {formatFileSize(compressionInfo.compressedSize)})
                  </p>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
