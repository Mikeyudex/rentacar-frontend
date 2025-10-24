import type {
  Vehicle,
  CreateVehicleData,
  UpdateVehicleData,
  VehicleServiceResponse,
  VehicleFilters,
} from "@/lib/vehicle-types"
import type { PaginatedResponse, PaginationParams } from "@/lib/types"
import { getTokenFromCookie } from "@/lib/get-token-from-coockie";

const API_URL = process.env.NEXT_PUBLIC_ENV === "LOCAL" ? process.env.NEXT_PUBLIC_API_URL_LOCAL : process.env.NEXT_PUBLIC_API_URL;

// Datos simulados de vehículos
const vehiclesData: Vehicle[] = [
  {
    id: "1",
    patente: "ABC123",
    marca: "Toyota",
    modelo: "Corolla",
    numMotor: "4A-FE123456",
    numVin: "JT2AE94A0X0123456",
    color: "Blanco",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    patente: "XYZ789",
    marca: "Honda",
    modelo: "Civic",
    numMotor: "D16Y8789012",
    numVin: "2HGEJ6618XH123789",
    color: "Azul",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    patente: "DEF456",
    marca: "Ford",
    modelo: "Focus",
    numMotor: "ZETEC345678",
    numVin: "1FAFP34P04W123456",
    color: "Rojo",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
]

// Función para generar ID único
function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Función para validar patente única
function isPatenteUnique(patente: string, excludeId?: string): boolean {
  return !vehiclesData.some(
    (vehicle) => vehicle.patente.toLowerCase() === patente.toLowerCase() && vehicle.id !== excludeId,
  )
}

// Función para validar número de motor único
function isNumMotorUnique(numMotor: string, excludeId?: string): boolean {
  return !vehiclesData.some(
    (vehicle) => vehicle.numMotor.toLowerCase() === numMotor.toLowerCase() && vehicle.id !== excludeId,
  )
}

// Función para validar número VIN único
function isNumVinUnique(numVin: string, excludeId?: string): boolean {
  return !vehiclesData.some(
    (vehicle) => vehicle.numVin.toLowerCase() === numVin.toLowerCase() && vehicle.id !== excludeId,
  )
}

// Obtener lista de vehículos con paginación y filtros
export async function getVehicles(params: PaginationParams & VehicleFilters): Promise<PaginatedResponse<Vehicle>> {
  const query = new URLSearchParams()

  // Agregar parámetros a la query string
  if (params.page) query.set("page", params.page.toString())
  if (params.limit) query.set("limit", params.limit.toString())
  if (params.search) query.set("search", params.search)
  if (params.sortBy) query.set("sortBy", params.sortBy)
  if (params.sortOrder) query.set("sortOrder", params.sortOrder)
  if (params.marca) query.set("marca", params.marca)
  if (params.color) query.set("color", params.color)

  const url = `${API_URL}/vehicles?${query.toString()}`

  try {
    let token = getTokenFromCookie();
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error al obtener vehículos: ${response.statusText}`)
    }

    const result = await response.json()
    let mappedVehicles: Vehicle[] = result.data.map((vehicle: any) => ({
      ...vehicle,
      id: vehicle?._id,
    }));
    result.data = mappedVehicles;
    return result as PaginatedResponse<Vehicle>
  } catch (error) {
    console.error("Error al obtener vehículos desde la API:", error)
    throw error
  }
}

// Obtener vehículo por ID
export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    let token = getTokenFromCookie();
    const response = await fetch(`${API_URL}/vehicles/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Error al obtener vehículo: ${response.statusText}`);
    }

    const result = await response.json();

    return result.data as Vehicle;
  } catch (error) {
    console.error("Error al obtener vehículo por ID:", error);
    throw error;
  }
}
// Crear nuevo vehículo
export async function createVehicle(data: CreateVehicleData): Promise<VehicleServiceResponse> {
  try {
    let token = getTokenFromCookie();
    const response = await fetch(`${API_URL}/vehicles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Error al crear el vehículo",
      };
    }

    return {
      success: true,
      message: "Vehículo creado exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error("Error al crear vehículo:", error);
    return {
      success: false,
      message: "Error de red o servidor",
    };
  }
}

// Actualizar vehículo
export async function updateVehicle(data: UpdateVehicleData): Promise<VehicleServiceResponse> {
  try {
    let token = getTokenFromCookie();
    const response = await fetch(`${API_URL}/vehicles/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Error al actualizar el vehículo",
      };
    }

    return {
      success: true,
      message: "Vehículo actualizado exitosamente",
      data: result.data,
    };
  } catch (error) {
    console.error("Error al actualizar vehículo:", error);
    return {
      success: false,
      message: "Error de red o servidor",
    };
  }
}

// Eliminar vehículo
export async function deleteVehicle(id: string): Promise<VehicleServiceResponse> {
  try {
    let token = getTokenFromCookie();
    const response = await fetch(`${API_URL}/vehicles/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Error al eliminar el vehículo",
      };
    }

    return {
      success: true,
      message: "Vehículo eliminado exitosamente",
    };
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    return {
      success: false,
      message: "Error de red o servidor",
    };
  }
}

// Obtener marcas únicas para filtros
export async function getVehicleBrands(): Promise<string[]> {
  const brands = [...new Set(vehiclesData.map((v) => v.marca))].sort()
  return brands
}

// Obtener colores únicos para filtros
export async function getVehicleColors(): Promise<string[]> {
  const colors = [...new Set(vehiclesData.map((v) => v.color))].sort()
  return colors
}
