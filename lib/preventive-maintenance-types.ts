export interface PreventiveMaintenanceItem {
  id?: string
  descripcion: string
  costo: number
  cantidad: number
  subtotal: number
}

export interface PreventiveMaintenance {
  id: string
  vehiculoId: string
  vehiculoPatente?: string
  vehiculoMarca?: string
  vehiculoModelo?: string
  fecha: string
  tipoMantencion: "preventiva" | "correctiva"
  kilometraje: number
  observaciones?: string
  items: PreventiveMaintenanceItem[]
  total: number
  otNumero: string
  estado: "pendiente" | "en_proceso" | "completada" | "cancelada"
  creadoPor?: string
  creadoEn: string
  actualizadoEn: string
}

export interface MaintenanceFormData {
  vehiculoId: string
  fecha: string
  tipoMantencion: "preventiva" | "correctiva"
  kilometraje: number
  observaciones?: string
  items: PreventiveMaintenanceItem[]
}

export interface MaintenanceFilters {
  vehiculoId?: string
  tipoMantencion?: string
  estado?: string
  fechaDesde?: string
  fechaHasta?: string
}

export interface PreventiveMaintenancePaginatedResponse {
  data: PreventiveMaintenance[]
  total: number
  page: number
  limit: number
  totalPages: number
}
