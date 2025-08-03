import type {
  VehicleDocument,
  CreateDocumentData,
  UpdateDocumentData,
  DocumentServiceResponse,
  UploadResponse,
} from "@/lib/document-types"
import { getTokenFromCookie } from "@/lib/get-token-from-coockie"


const API_URL = process.env.NEXT_PUBLIC_ENV === "LOCAL" ? process.env.NEXT_PUBLIC_API_URL_LOCAL : process.env.NEXT_PUBLIC_API_URL

// Datos simulados de documentos
const documentsData: VehicleDocument[] = [
  {
    id: "doc1",
    vehicleId: "1",
    permisoCirculacionFile: "https://example.com/files/permiso-abc123.pdf",
    permisoCirculacionExpiracion: "2024-12-31",
    revisionTecnicaFile: "https://example.com/files/revision-abc123.pdf",
    revisionTecnicaExpiracion: "2024-06-30",
    seguroObligatorioFile: "https://example.com/files/seguro-abc123.pdf",
    seguroObligatorioExpiracion: "2024-08-15",
    seguroGeneralFile: "https://example.com/files/seguro-general-abc123.pdf",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-20T14:45:00Z",
  },
]

// Función para generar ID único
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Obtener documentos de un vehículo
export async function getVehicleDocuments(vehicleId: string): Promise<VehicleDocument | null> {
  try {
    let token = getTokenFromCookie();
    let response = await fetch(`${API_URL}/control-documental/getByVehicleId/${vehicleId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      if (response.status === 401) {
        throw new Error("No tienes permisos para acceder a este recurso");
      }
      throw new Error("Error al obtener documentos");
    }
    let dataResponse = await response.json();
    let document = dataResponse?.data || null;
    return document || null;
  } catch (error) {
    console.error("Error al obtener documentos:", error)
    throw error
  }
}

// Crear documentos para un vehículo
export async function createVehicleDocuments(data: CreateDocumentData): Promise<DocumentServiceResponse> {
  console.log("Creando documentos del vehículo:", data)
  try {
    let token = getTokenFromCookie();
    let response = await fetch(`${API_URL}/control-documental`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al crear documentos');
    let dataResponse = await response.json();
    let newDocument = dataResponse?.data || null;
    return {
      success: true,
      message: "Documentos creados exitosamente",
      data: newDocument,
    }
  } catch (error) {
    console.error("Error al crear documentos:", error)
    throw error
  }
}

// Actualizar documentos de un vehículo
export async function updateVehicleDocuments(data: UpdateDocumentData): Promise<DocumentServiceResponse> {
  console.log("Actualizando documentos:", data)

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const documentIndex = documentsData.findIndex((doc) => doc.id === data.id)

  if (documentIndex === -1) {
    return {
      success: false,
      message: "Documentos no encontrados",
    }
  }

  // Actualizar documento
  const updatedDocument: VehicleDocument = {
    ...documentsData[documentIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  documentsData[documentIndex] = updatedDocument

  console.log("Documentos actualizados exitosamente:", updatedDocument)

  return {
    success: true,
    message: "Documentos actualizados exitosamente",
    data: updatedDocument,
  }
}

// Subir archivo
export async function uploadFile(file: File): Promise<UploadResponse> {
  console.log("Subiendo archivo:", file.name, "Tamaño:", file.size)
  // Validaciones básicas
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      success: false,
      message: "El archivo es demasiado grande (máximo 10MB)",
    }
  }

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
  if (!allowedTypes.includes(file.type)) {
    return {
      success: false,
      message: "Tipo de archivo no permitido. Solo se permiten PDF, JPG y PNG",
    }
  }

  try {
    let formData = new FormData();
    formData.append("file", file);
    let token = getTokenFromCookie();
    let response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Error al subir archivo');

    let dataResponse = await response.json();

    let urlFile = dataResponse?.url || null;

    return {
      success: true,
      message: "Archivo subido exitosamente",
      url: `${API_URL}${urlFile}`,
    }

  } catch (error) {
    console.error("Error al subir archivo:", error)
    throw error
  }
}

// Eliminar archivo (opcional)
export async function deleteFile(fileUrl: string): Promise<{ success: boolean; message: string }> {
  console.log("Eliminando archivo:", fileUrl)

  // Simular delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    success: true,
    message: "Archivo eliminado exitosamente",
  }
}
