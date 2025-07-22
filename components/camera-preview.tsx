"use client"

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export interface CameraUploaderRef {
  stopCamera: () => void
}

type ImageUploadProps = {
  onImageCapture?: (imageDataUrl: string) => void
  preset?: string
  customOptions?: Record<string, any>
  showCompressionInfo?: boolean
}

type ImageData = {
  id: string
  dataUrl: string
  source: "camera" | "upload"
}

const MAX_IMAGES = 4

const CameraUploader = forwardRef<CameraUploaderRef, ImageUploadProps>(
  ({ onImageCapture, preset, customOptions, showCompressionInfo }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useImperativeHandle(ref, () => ({
      stopCamera: () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }
      },
    }))

    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const [images, setImages] = useState<ImageData[]>([])
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [loading, setLoading] = useState(false)
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

    // Aquí inicializas y guardas stream en streamRef
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    }

    useEffect(() => {
      startCamera()
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }
    }, [])

    const stopCamera = () => {
      stream?.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    const switchCamera = () => {
      stopCamera()
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
      startCamera()
    }

    const takePhoto = async () => {
      if (!videoRef.current || !canvasRef.current || images.length >= MAX_IMAGES) return

      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL("image/jpeg", customOptions?.quality || 0.9)

      const newImage: ImageData = {
        id: crypto.randomUUID(),
        dataUrl,
        source: "camera",
      }

      setImages((prev) => {
        const updated = [...prev, newImage]
        return updated
      })

      onImageCapture?.(dataUrl)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return

      const remaining = MAX_IMAGES - images.length
      const selected = Array.from(e.target.files).slice(0, remaining)

      selected.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          const newImage: ImageData = {
            id: crypto.randomUUID(),
            dataUrl,
            source: "upload",
          }

          setImages((prev) => {
            const updated = [...prev, newImage]
            return updated
          })

          onImageCapture?.(dataUrl)
        }
        reader.readAsDataURL(file)
      })

      if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const removeImage = (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id))
    }

    return (
      <div className="w-full max-w-xl mx-auto space-y-4">
        <div className="rounded-xl overflow-hidden shadow bg-black relative">
          <video ref={videoRef} playsInline muted autoPlay className="w-full h-auto object-cover" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
              Cargando cámara...
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={startCamera}>🎥 Iniciar cámara</Button>
          <Button variant="outline" onClick={switchCamera}>
            🔄 Cambiar cámara
          </Button>
          <Button onClick={takePhoto} disabled={images.length >= MAX_IMAGES}>
            📸 Tomar foto
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={images.length >= MAX_IMAGES}
          >
            📂 Subir imagen
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {preset && <p className="text-xs text-muted-foreground">🔖 Preset: {preset}</p>}
        {customOptions && (
          <p className="text-xs text-muted-foreground">⚙️ Opciones: {JSON.stringify(customOptions)}</p>
        )}
        {showCompressionInfo && (
          <p className="text-xs text-muted-foreground">
            Imágenes comprimidas en formato JPEG (calidad: {customOptions?.quality || 0.9})
          </p>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.dataUrl}
                  alt="preview"
                  className="rounded-lg shadow border w-full aspect-square object-cover"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    )
  }
)
export default CameraUploader
