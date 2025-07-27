// Tipos para los vehículos
export interface Vehicle {
  id: string
  patente: string
  marca: string
  modelo: string
  numMotor: string
  numVin: string
  color: string
  createdAt: string
  updatedAt: string
}

// Datos para crear un vehículo
export interface CreateVehicleData {
  patente: string
  marca: string
  modelo: string
  numMotor: string
  numVin: string
  color: string
}

// Datos para actualizar un vehículo
export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  id: string
}

// Respuesta del servicio
export interface VehicleServiceResponse {
  success: boolean
  message: string
  data?: Vehicle
}

// Parámetros para filtros
export interface VehicleFilters {
  search?: string
  marca?: string
  color?: string
}
