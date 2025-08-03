// Tipos para la gestión documental
export interface VehicleDocument {
  id: string
  vehicleId: string
  padron?: string
  permisoCirculacionFile?: string
  permisoCirculacionExpiracion?: string
  revisionTecnicaFile?: string
  revisionTecnicaExpiracion?: string
  seguroObligatorioFile?: string
  seguroObligatorioExpiracion?: string
  seguroGeneralFile?: string
  createdAt: string
  updatedAt: string
}

// Datos para crear documentos
export interface CreateDocumentData {
  vehicleId: string
  permisoCirculacionFile?: string
  permisoCirculacionExpiracion?: string
  revisionTecnicaFile?: string
  revisionTecnicaExpiracion?: string
  seguroObligatorioFile?: string
  seguroObligatorioExpiracion?: string
  seguroGeneralFile?: string
}

// Datos para actualizar documentos
export interface UpdateDocumentData extends Partial<CreateDocumentData> {
  id: string
}

// Respuesta del servicio
export interface DocumentServiceResponse {
  success: boolean
  message: string
  data?: VehicleDocument
}

// Respuesta de upload
export interface UploadResponse {
  success: boolean
  message: string
  url?: string
}

// Tipos de documentos
export type DocumentType = "padron" | "permisoCirculacion" | "revisionTecnica" | "seguroObligatorio" | "seguroGeneral"

// Información de cada tipo de documento
export interface DocumentInfo {
  key: DocumentType
  label: string
  fileKey: keyof VehicleDocument
  expirationKey?: keyof VehicleDocument
  icon: string
  color: string
  required: boolean
}

// Estado de carga de archivos
export interface FileUploadState {
  [key: string]: {
    isUploading: boolean
    progress: number
    error?: string
  }
}
