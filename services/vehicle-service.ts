import type {
  Vehicle,
  CreateVehicleData,
  UpdateVehicleData,
  VehicleServiceResponse,
  VehicleFilters,
} from "@/lib/vehicle-types"
import type { PaginatedResponse, PaginationParams } from "@/lib/types"

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
    fechaCreacion: "2024-01-15T10:30:00Z",
    fechaActualizacion: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    patente: "XYZ789",
    marca: "Honda",
    modelo: "Civic",
    numMotor: "D16Y8789012",
    numVin: "2HGEJ6618XH123789",
    color: "Azul",
    fechaCreacion: "2024-01-16T14:20:00Z",
    fechaActualizacion: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    patente: "DEF456",
    marca: "Ford",
    modelo: "Focus",
    numMotor: "ZETEC345678",
    numVin: "1FAFP34P04W123456",
    color: "Rojo",
    fechaCreacion: "2024-01-17T09:15:00Z",
    fechaActualizacion: "2024-01-17T09:15:00Z",
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
  console.log("Obteniendo vehículos con parámetros:", params)

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredVehicles = [...vehiclesData]

  // Aplicar filtros
  if (params.search) {
    const searchTerm = params.search.toLowerCase()
    filteredVehicles = filteredVehicles.filter(
      (vehicle) =>
        vehicle.patente.toLowerCase().includes(searchTerm) ||
        vehicle.marca.toLowerCase().includes(searchTerm) ||
        vehicle.modelo.toLowerCase().includes(searchTerm) ||
        vehicle.color.toLowerCase().includes(searchTerm),
    )
  }

  if (params.marca) {
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      vehicle.marca.toLowerCase().includes(params.marca!.toLowerCase()),
    )
  }

  if (params.color) {
    filteredVehicles = filteredVehicles.filter((vehicle) =>
      vehicle.color.toLowerCase().includes(params.color!.toLowerCase()),
    )
  }

  // Aplicar ordenamiento
  if (params.sortBy) {
    filteredVehicles.sort((a, b) => {
      const aValue = a[params.sortBy as keyof Vehicle] as string
      const bValue = b[params.sortBy as keyof Vehicle] as string

      if (params.sortOrder === "desc") {
        return bValue.localeCompare(aValue)
      }
      return aValue.localeCompare(bValue)
    })
  }

  // Aplicar paginación
  const startIndex = (params.page - 1) * params.limit
  const endIndex = startIndex + params.limit
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex)

  const totalPages = Math.ceil(filteredVehicles.length / params.limit)

  return {
    data: paginatedVehicles,
    meta: {
      currentPage: params.page,
      totalPages,
      totalItems: filteredVehicles.length,
      itemsPerPage: params.limit,
    },
  }
}

// Obtener vehículo por ID
export async function getVehicleById(id: string): Promise<Vehicle | null> {
  console.log("Obteniendo vehículo por ID:", id)

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 300))

  const vehicle = vehiclesData.find((v) => v.id === id)
  return vehicle || null
}

// Crear nuevo vehículo
export async function createVehicle(data: CreateVehicleData): Promise<VehicleServiceResponse> {
  console.log("Creando vehículo:", data)

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Validaciones
  if (!isPatenteUnique(data.patente)) {
    return {
      success: false,
      message: "Ya existe un vehículo con esta patente",
    }
  }

  if (!isNumMotorUnique(data.numMotor)) {
    return {
      success: false,
      message: "Ya existe un vehículo con este número de motor",
    }
  }

  if (!isNumVinUnique(data.numVin)) {
    return {
      success: false,
      message: "Ya existe un vehículo con este número VIN",
    }
  }

  // Crear nuevo vehículo
  const newVehicle: Vehicle = {
    id: generateId(),
    ...data,
    patente: data.patente.toUpperCase(),
    marca: data.marca.trim(),
    modelo: data.modelo.trim(),
    numMotor: data.numMotor.toUpperCase(),
    numVin: data.numVin.toUpperCase(),
    color: data.color.trim(),
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
  }

  vehiclesData.push(newVehicle)

  console.log("Vehículo creado exitosamente:", newVehicle)

  return {
    success: true,
    message: "Vehículo creado exitosamente",
    data: newVehicle,
  }
}

// Actualizar vehículo
export async function updateVehicle(data: UpdateVehicleData): Promise<VehicleServiceResponse> {
  console.log("Actualizando vehículo:", data)

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 800))

  const vehicleIndex = vehiclesData.findIndex((v) => v.id === data.id)

  if (vehicleIndex === -1) {
    return {
      success: false,
      message: "Vehículo no encontrado",
    }
  }

  // Validaciones para campos únicos si se están actualizando
  if (data.patente && !isPatenteUnique(data.patente, data.id)) {
    return {
      success: false,
      message: "Ya existe un vehículo con esta patente",
    }
  }

  if (data.numMotor && !isNumMotorUnique(data.numMotor, data.id)) {
    return {
      success: false,
      message: "Ya existe un vehículo con este número de motor",
    }
  }

  if (data.numVin && !isNumVinUnique(data.numVin, data.id)) {
    return {
      success: false,
      message: "Ya existe un vehículo con este número VIN",
    }
  }

  // Actualizar vehículo
  const updatedVehicle: Vehicle = {
    ...vehiclesData[vehicleIndex],
    ...data,
    patente: data.patente ? data.patente.toUpperCase() : vehiclesData[vehicleIndex].patente,
    marca: data.marca ? data.marca.trim() : vehiclesData[vehicleIndex].marca,
    modelo: data.modelo ? data.modelo.trim() : vehiclesData[vehicleIndex].modelo,
    numMotor: data.numMotor ? data.numMotor.toUpperCase() : vehiclesData[vehicleIndex].numMotor,
    numVin: data.numVin ? data.numVin.toUpperCase() : vehiclesData[vehicleIndex].numVin,
    color: data.color ? data.color.trim() : vehiclesData[vehicleIndex].color,
    fechaActualizacion: new Date().toISOString(),
  }

  vehiclesData[vehicleIndex] = updatedVehicle

  console.log("Vehículo actualizado exitosamente:", updatedVehicle)

  return {
    success: true,
    message: "Vehículo actualizado exitosamente",
    data: updatedVehicle,
  }
}

// Eliminar vehículo
export async function deleteVehicle(id: string): Promise<VehicleServiceResponse> {
  console.log("Eliminando vehículo:", id)

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500))

  const vehicleIndex = vehiclesData.findIndex((v) => v.id === id)

  if (vehicleIndex === -1) {
    return {
      success: false,
      message: "Vehículo no encontrado",
    }
  }

  const deletedVehicle = vehiclesData[vehicleIndex]
  vehiclesData.splice(vehicleIndex, 1)

  console.log("Vehículo eliminado exitosamente:", deletedVehicle)

  return {
    success: true,
    message: "Vehículo eliminado exitosamente",
    data: deletedVehicle,
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
