"use client"

import { useState, useEffect } from "react"
import { Calendar, FileText, Upload, Eye, Trash2, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import {
  getVehicleDocuments,
  createVehicleDocuments,
  updateVehicleDocuments,
  uploadFile,
} from "@/services/document-service"
import type {
  VehicleDocument,
  DocumentType,
  DocumentInfo,
  FileUploadState,
  CreateDocumentData,
} from "@/lib/document-types"

interface DocumentManagementProps {
  vehicleId: string
  vehiclePatente: string
}

// Configuración de tipos de documentos
const DOCUMENT_TYPES: DocumentInfo[] = [
  {
    key: "padron",
    label: "Padrón",
    fileKey: "padron",
    icon: "🧾",
    color: "bg-green-500",
    required: true,
  },
  {
    key: "permisoCirculacion",
    label: "Permiso de Circulación",
    fileKey: "permisoCirculacionFile",
    expirationKey: "permisoCirculacionExpiracion",
    icon: "📑",
    color: "bg-blue-500",
    required: true,
  },
  {
    key: "revisionTecnica",
    label: "Revisión Técnica",
    fileKey: "revisionTecnicaFile",
    expirationKey: "revisionTecnicaExpiracion",
    icon: "🔧",
    color: "bg-green-500",
    required: true,
  },
  {
    key: "seguroObligatorio",
    label: "Seguro Obligatorio",
    fileKey: "seguroObligatorioFile",
    expirationKey: "seguroObligatorioExpiracion",
    icon: "🛡️",
    color: "bg-red-500",
    required: true,
  },
  {
    key: "seguroGeneral",
    label: "Seguro General",
    fileKey: "seguroGeneralFile",
    icon: "🛡️",
    color: "bg-red-500",
    required: true,
  },

]

export function DocumentManagement({ vehicleId, vehiclePatente }: DocumentManagementProps) {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<VehicleDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [uploadStates, setUploadStates] = useState<FileUploadState>({})
  const [formData, setFormData] = useState<CreateDocumentData>({
    vehicleId,
  })

  useEffect(() => {
    loadDocuments()
  }, [vehicleId])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      const documentData = await getVehicleDocuments(vehicleId)
      setDocuments(documentData)

      if (!documentData) {
        setIsCreating(true)
      }
    } catch (error) {
      console.error("Error al cargar documentos:", error)
      toast({
        title: "Error",
        description: "Error al cargar los documentos del vehículo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File, documentType: DocumentType) => {
    const uploadKey = `${documentType}_file`

    // Actualizar estado de carga
    setUploadStates((prev) => ({
      ...prev,
      [uploadKey]: {
        isUploading: true,
        progress: 0,
      },
    }))

    try {
      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadStates((prev) => ({
          ...prev,
          [uploadKey]: {
            ...prev[uploadKey],
            progress: Math.min((prev[uploadKey]?.progress || 0) + 10, 90),
          },
        }))
      }, 200)

      const response = await uploadFile(file)
      clearInterval(progressInterval)

      if (response.success && response.url) {
        // Actualizar estado con URL del archivo
        if (isCreating) {
          const fileKey = DOCUMENT_TYPES.find((dt) => dt.key === documentType)?.fileKey as keyof CreateDocumentData
          setFormData((prev) => ({
            ...prev,
            [fileKey]: response.url,
          }))
        } else if (documents) {
          // Actualizar documento existente
          const fileKey = DOCUMENT_TYPES.find((dt) => dt.key === documentType)?.fileKey as keyof VehicleDocument
          const updateData = {
            id: documents.id,
            [fileKey]: response.url,
          }

          const updateResponse = await updateVehicleDocuments(updateData)
          if (updateResponse.success && updateResponse.data) {
            setDocuments(updateResponse.data)
            toast({
              title: "¡Éxito!",
              description: "Archivo actualizado correctamente",
            })
          }
        }

        setUploadStates((prev) => ({
          ...prev,
          [uploadKey]: {
            isUploading: false,
            progress: 100,
          },
        }))

        toast({
          title: "¡Éxito!",
          description: "Archivo subido correctamente",
        })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error("Error al subir archivo:", error)
      setUploadStates((prev) => ({
        ...prev,
        [uploadKey]: {
          isUploading: false,
          progress: 0,
          error: error instanceof Error ? error.message : "Error al subir archivo",
        },
      }))

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir archivo",
        variant: "destructive",
      })
    }
  }

  const handleDateChange = (documentType: DocumentType, date: string) => {
    const expirationKey = DOCUMENT_TYPES.find((dt) => dt.key === documentType)
      ?.expirationKey as keyof CreateDocumentData

    if (isCreating) {
      setFormData((prev) => ({
        ...prev,
        [expirationKey]: date,
      }))
    } else if (documents) {
      // Actualizar documento existente
      const updateData = {
        id: documents.id,
        [expirationKey]: date,
      }

      updateVehicleDocuments(updateData).then((response) => {
        if (response.success && response.data) {
          setDocuments(response.data)
          toast({
            title: "¡Éxito!",
            description: "Fecha actualizada correctamente",
          })
        }
      })
    }
  }

  const handleCreateDocuments = async () => {
    try {
      setIsSaving(true)
      const response = await createVehicleDocuments(formData)

      if (response.success && response.data) {
        setDocuments(response.data)
        setIsCreating(false)
        toast({
          title: "¡Éxito!",
          description: response.message,
        })
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear documentos:", error)
      toast({
        title: "Error",
        description: "Error al crear los documentos",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return { status: "missing", label: "Sin fecha", color: "bg-gray-500" }

    const today = new Date()
    const expiration = new Date(expirationDate)
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { status: "expired", label: "Vencido", color: "bg-red-500" }
    } else if (diffDays <= 30) {
      return { status: "warning", label: `${diffDays} días`, color: "bg-yellow-500" }
    } else {
      return { status: "valid", label: `${diffDays} días`, color: "bg-green-500" }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificada"
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  const openFilePreview = (fileUrl: string) => {
    window.open(fileUrl, "_blank")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Crear Gestión Documental</h3>
          <p className="text-muted-foreground">
            No se encontraron documentos para el vehículo <strong>{vehiclePatente}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DOCUMENT_TYPES.map((docType) => {
            const fileKey = docType.fileKey as keyof CreateDocumentData
            const expirationKey = docType.expirationKey as keyof CreateDocumentData
            const uploadKey = `${docType.key}_file`
            const uploadState = uploadStates[uploadKey]
            const hasFile = formData[fileKey]

            return (
              <Card key={docType.key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-lg">{docType.icon}</span>
                    {docType.label}
                    {docType.required && (
                      <Badge variant="destructive" className="text-xs">
                        Requerido
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Upload de archivo */}
                  <div>
                    <Label htmlFor={`file-${docType.key}`}>Archivo</Label>
                    <div className="mt-1">
                      {hasFile ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFilePreview(formData[fileKey] as string)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver archivo
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData((prev) => ({ ...prev, [fileKey]: undefined }))}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Quitar
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Input
                            id={`file-${docType.key}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                handleFileUpload(file, docType.key)
                              }
                            }}
                            disabled={uploadState?.isUploading}
                          />
                          {uploadState?.isUploading && (
                            <div className="mt-2">
                              <Progress value={uploadState.progress} className="h-2" />
                              <p className="text-sm text-muted-foreground mt-1">Subiendo... {uploadState.progress}%</p>
                            </div>
                          )}
                          {uploadState?.error && <p className="text-sm text-red-500 mt-1">{uploadState.error}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fecha de expiración */}
                  {docType.expirationKey && (
                    <div>
                      <Label htmlFor={`date-${docType.key}`}>Fecha de Expiración</Label>
                      <Input
                        id={`date-${docType.key}`}
                        type="date"
                        value={(formData[expirationKey] as string) || ""}
                        onChange={(e) => handleDateChange(docType.key, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center pt-6">
          <Button onClick={handleCreateDocuments} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Crear Gestión Documental
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Documentos del Vehículo</h3>
        <p className="text-muted-foreground">
          Gestión documental para el vehículo <strong>{vehiclePatente}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DOCUMENT_TYPES.map((docType) => {
          const fileKey = docType.fileKey as keyof VehicleDocument
          const expirationKey = docType.expirationKey as keyof VehicleDocument
          const uploadKey = `${docType.key}_file`
          const uploadState = uploadStates[uploadKey]
          const hasFile = documents?.[fileKey]
          const expirationDate = documents?.[expirationKey] as string
          const expirationStatus = getExpirationStatus(expirationDate)

          return (
            <Card key={docType.key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{docType.icon}</span>
                    <span className="text-base">{docType.label}</span>
                  </div>
                  <Badge className={`${expirationStatus.color} text-white`}>{expirationStatus.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Archivo */}
                <div>
                  <Label>Archivo</Label>
                  <div className="mt-1">
                    {hasFile ? (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openFilePreview(documents[fileKey] as string)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver archivo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = ".pdf,.jpg,.jpeg,.png"
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                handleFileUpload(file, docType.key)
                              }
                            }
                            input.click()
                          }}
                          disabled={uploadState?.isUploading}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Reemplazar
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = ".pdf,.jpg,.jpeg,.png"
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) {
                                handleFileUpload(file, docType.key)
                              }
                            }
                            input.click()
                          }}
                          disabled={uploadState?.isUploading}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Subir archivo
                        </Button>
                        {uploadState?.isUploading && (
                          <div className="mt-2">
                            <Progress value={uploadState.progress} className="h-2" />
                            <p className="text-sm text-muted-foreground mt-1">Subiendo... {uploadState.progress}%</p>
                          </div>
                        )}
                        {uploadState?.error && <p className="text-sm text-red-500 mt-1">{uploadState.error}</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Fecha de expiración */}
                {
                  expirationKey && (
                    <div>
                      <Label>Fecha de Expiración</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="date"
                          value={expirationDate || ""}
                          onChange={(e) => handleDateChange(docType.key, e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(expirationDate)}
                        </div>
                      </div>
                    </div>
                  )
                }
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Información adicional */}
      {documents && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Información de Registro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Creado el</Label>
                <p>{formatDate(documents.createdAt)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Última actualización</Label>
                <p>{formatDate(documents.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
