import type {
  PreventiveMaintenance,
  MaintenanceFormData,
  PreventiveMaintenancePaginatedResponse,
  MaintenanceFilters,
} from "@/lib/preventive-maintenance-types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

// Datos de ejemplo para desarrollo
const mockMaintenance: PreventiveMaintenance[] = [
  {
    id: "1",
    vehiculoId: "1",
    vehiculoPatente: "AA-BB-12",
    vehiculoMarca: "Toyota",
    vehiculoModelo: "Hilux",
    fecha: "2024-01-15",
    tipoMantencion: "preventiva",
    kilometraje: 15000,
    observaciones: "Mantención de 15.000 km",
    items: [
      { id: "1", descripcion: "Filtro aceite", costo: 90250, cantidad: 1, subtotal: 90250 },
      { id: "2", descripcion: "Filtro combustible", costo: 45000, cantidad: 1, subtotal: 45000 },
      { id: "3", descripcion: "Aceite motor 5W-30", costo: 85000, cantidad: 1, subtotal: 85000 },
    ],
    total: 220250,
    otNumero: "OT-2024-001",
    estado: "completada",
    creadoPor: "admin",
    creadoEn: "2024-01-15T10:00:00Z",
    actualizadoEn: "2024-01-15T16:30:00Z",
  },
  {
    id: "2",
    vehiculoId: "2",
    vehiculoPatente: "CC-DD-34",
    vehiculoMarca: "Ford",
    vehiculoModelo: "Ranger",
    fecha: "2024-01-20",
    tipoMantencion: "preventiva",
    kilometraje: 30000,
    observaciones: "Mantención de 30.000 km",
    items: [
      { id: "4", descripcion: "Filtro aceite", costo: 90250, cantidad: 1, subtotal: 90250 },
      { id: "5", descripcion: "Filtro combustible", costo: 45000, cantidad: 1, subtotal: 45000 },
      { id: "6", descripcion: "Filtro aire", costo: 35000, cantidad: 1, subtotal: 35000 },
      { id: "7", descripcion: "Aceite motor 10W-40", costo: 95000, cantidad: 1, subtotal: 95000 },
    ],
    total: 265250,
    otNumero: "OT-2024-002",
    estado: "en_proceso",
    creadoPor: "admin",
    creadoEn: "2024-01-20T09:00:00Z",
    actualizadoEn: "2024-01-20T09:00:00Z",
  },
]

class MaintenanceService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    }
  }

  async getMaintenance(page = 1, limit = 10, filters?: MaintenanceFilters): Promise<PreventiveMaintenancePaginatedResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.vehiculoId && { vehiculoId: filters.vehiculoId }),
        ...(filters?.tipoMantencion && { tipoMantencion: filters.tipoMantencion }),
        ...(filters?.estado && { estado: filters.estado }),
        ...(filters?.fechaDesde && { fechaDesde: filters.fechaDesde }),
        ...(filters?.fechaHasta && { fechaHasta: filters.fechaHasta }),
      })

      const response = await fetch(`${API_URL}/maintenance?${params}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Error al obtener las mantenciones")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching maintenance:", error)

      // Retornar datos mock en caso de error
      let filteredData = [...mockMaintenance]

      if (filters?.vehiculoId) {
        filteredData = filteredData.filter((m) => m.vehiculoId === filters.vehiculoId)
      }

      if (filters?.tipoMantencion) {
        filteredData = filteredData.filter((m) => m.tipoMantencion === filters.tipoMantencion)
      }

      if (filters?.estado) {
        filteredData = filteredData.filter((m) => m.estado === filters.estado)
      }

      const start = (page - 1) * limit
      const end = start + limit
      const paginatedData = filteredData.slice(start, end)

      return {
        data: paginatedData,
        total: filteredData.length,
        page,
        limit,
        totalPages: Math.ceil(filteredData.length / limit),
      }
    }
  }

  async getMaintenanceById(id: string): Promise<PreventiveMaintenance> {
    try {
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Error al obtener la mantención")
      }

      return await response.json()
    } catch (error) {
      console.error("Error fetching maintenance:", error)
      const found = mockMaintenance.find((m) => m.id === id)
      if (!found) {
        throw new Error("Mantención no encontrada")
      }
      return found
    }
  }

  async createMaintenance(data: MaintenanceFormData): Promise<PreventiveMaintenance> {
    try {
      const response = await fetch(`${API_URL}/maintenance`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al crear la mantención")
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating maintenance:", error)

      // Simular creación
      const newMaintenance: PreventiveMaintenance = {
        id: Date.now().toString(),
        ...data,
        total: data.items.reduce((sum, item) => sum + item.subtotal, 0),
        otNumero: `OT-${new Date().getFullYear()}-${String(mockMaintenance.length + 1).padStart(3, "0")}`,
        estado: "pendiente",
        creadoPor: "admin",
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
      }

      return newMaintenance
    }
  }

  async updateMaintenance(id: string, data: Partial<MaintenanceFormData>): Promise<PreventiveMaintenance> {
    try {
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la mantención")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating maintenance:", error)
      throw error
    }
  }

  async deleteMaintenance(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/maintenance/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la mantención")
      }
    } catch (error) {
      console.error("Error deleting maintenance:", error)
      throw error
    }
  }

  async updateMaintenanceStatus(id: string, estado: PreventiveMaintenance["estado"]): Promise<PreventiveMaintenance> {
    try {
      const response = await fetch(`${API_URL}/maintenance/${id}/status`, {
        method: "PATCH",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ estado }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el estado de la mantención")
      }

      return await response.json()
    } catch (error) {
      console.error("Error updating maintenance status:", error)
      throw error
    }
  }
}

export const maintenanceService = new MaintenanceService()
