"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, ImagePlus, RefreshCcw } from "lucide-react"
import { processImage, IMAGE_PRESETS } from "@/lib/image-utils"
import { DroppedFile } from "@/lib/types"
import { createDroppedFiles } from "@/lib/utils"

interface Props {
  open: boolean
  setOpen: (value: boolean) => void
  onImageCapture: (dataUrl: string) => void
  preset: keyof typeof IMAGE_PRESETS
  customOptions?: {
    quality?: number
    width?: number
    height?: number
    maintainAspectRatio?: boolean
    backgroundColor?: string
    format?: "image/jpeg" | "image/png" | "image/webp"
  }
  showCompressionInfo?: boolean
  droppedFiles: DroppedFile[]
  setDroppedFiles: any
}

export default function ImagePickerModal({
  open,
  setOpen,
  onImageCapture,
  preset,
  customOptions,
  showCompressionInfo = false,
  droppedFiles,
  setDroppedFiles
}: Props) {
  const [tab, setTab] = useState("upload")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const [isUploadingDropzone, setIsUploadingDropzone] = useState(false)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  useEffect(() => {
    if (open && tab === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [open, tab, facingMode])

  const handleCapture = async () => {
    if (!videoRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL("image/jpeg")
      const presetOptions = IMAGE_PRESETS[preset]
      const result = await processImage(dataUrl, {
        ...presetOptions,
        ...customOptions,
      })
      onImageCapture(result.dataUrl)
      setOpen(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    const presetOptions = IMAGE_PRESETS[preset]
    for (const file of Array.from(files).slice(0, 4)) {
      const result = await processImage(file, {
        ...presetOptions,
        ...customOptions,
      })
      onImageCapture(result.dataUrl)
    }
    setOpen(false)
  }

  const handleCloseDialog = () => {
    setOpen(false)
    setDroppedFiles([])
    droppedFiles.forEach(({ preview }) => URL.revokeObjectURL(preview))
  }

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Agregar Imagen</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="upload">
              <ImagePlus className="h-4 w-4 mr-2" /> Subir Imagen
            </TabsTrigger>
            <TabsTrigger value="camera">
              <Camera className="h-4 w-4 mr-2" /> Usar Cámara
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const files = Array.from(e.dataTransfer.files)
                  .filter(file => file.type.startsWith("image/"))
                  .slice(0, 4 - droppedFiles.length)
                setDroppedFiles((prev: any) => [...prev, ...createDroppedFiles(files)])
              }}
              className="w-full min-h-32 flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-md mb-4 hover:bg-muted/30 transition-colors cursor-pointer text-sm text-muted-foreground p-4"
            >
              {droppedFiles.length === 0
                ? "Arrastra tus imágenes aquí"
                : (
                  <ul className="text-left w-full text-sm space-y-2">
                    {droppedFiles.map(({ file, preview }, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 cursor-move"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", idx.toString())
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault()
                          const draggedIndex = Number(e.dataTransfer.getData("text/plain"))
                          const targetIndex = idx
                          if (draggedIndex === targetIndex) return

                          const updatedFiles = [...droppedFiles]
                          const [draggedItem] = updatedFiles.splice(draggedIndex, 1)
                          updatedFiles.splice(targetIndex, 0, draggedItem)
                          setDroppedFiles(updatedFiles)
                        }}
                      >
                        <img src={preview} alt={file.name} className="w-10 h-10 object-cover rounded-sm border" />
                        <span className="truncate">{file.name}</span>
                      </li>
                    ))}
                  </ul>
                )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files
                  if (!files) return
                  setDroppedFiles((prev: any) => [...prev, ...createDroppedFiles(Array.from(files).slice(0, 4 - prev.length))])
                }}
                className="w-full"
              />
              <Button
                variant="default"
                onClick={async () => {
                  if (droppedFiles.length === 0) return
                  setIsUploadingDropzone(true)
                  const presetOptions = IMAGE_PRESETS[preset]

                  for (const { file } of droppedFiles) {
                    const result = await processImage(file, {
                      ...presetOptions,
                      ...customOptions,
                    })
                    onImageCapture(result.dataUrl)
                  }

                  setIsUploadingDropzone(false)
                  setDroppedFiles([])
                  setOpen(false)
                }}
                disabled={isUploadingDropzone}
              >
                {isUploadingDropzone ? "Subiendo..." : "Subir"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="camera">
            <div className="flex flex-col items-center gap-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="rounded-md w-full max-h-64 object-contain"
              />
              <div className="flex gap-2">
                <Button onClick={handleCapture}>Capturar</Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
                  }
                >
                  <RefreshCcw className="h-4 w-4 mr-1" /> Cambiar Cámara
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog >
  )
}
