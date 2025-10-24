import type { Customer, CreateCustomerData, CustomerFilters, CustomerResponse } from "@/lib/customer-types"

const API_URL = process.env.NEXT_PUBLIC_ENV === "LOCAL" ? process.env.NEXT_PUBLIC_API_URL_LOCAL : process.env.NEXT_PUBLIC_API_URL;


// Datos simulados para desarrollo
const mockCustomers: Customer[] = [
  {
    id: "1",
    nombres: "Juan Carlos",
    apellidos: "González Pérez",
    rut: "12345678-9",
    direccion: "Av. Providencia 1234, Santiago",
    email: "juan.gonzalez@email.com",
    telefono: "+56912345678",
    fotoCi: "/placeholder.svg?height=200&width=300",
    fotoLicencia: "/placeholder.svg?height=200&width=300",
    hojaAntecedentes: "/placeholder.svg?height=200&width=300",
    hojaConductor: "/placeholder.svg?height=200&width=300",
    eRut: "/placeholder.svg?height=200&width=300",
    contratoUrl: "/placeholder.svg?height=200&width=300",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    nombres: "María Elena",
    apellidos: "Rodríguez Silva",
    rut: "98765432-1",
    direccion: "Las Condes 5678, Santiago",
    email: "maria.rodriguez@email.com",
    telefono: "+56987654321",
    contratoUrl: "/placeholder.svg?height=200&width=300",
    createdAt: "2024-01-16T14:20:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    nombres: "Pedro Antonio",
    apellidos: "Martínez López",
    rut: "11223344-5",
    direccion: "Ñuñoa 9876, Santiago",
    email: "pedro.martinez@email.com",
    telefono: "+56911223344",
    fotoCi: "/placeholder.svg?height=200&width=300",
    fotoLicencia: "/placeholder.svg?height=200&width=300",
    contratoUrl: "/placeholder.svg?height=200&width=300",
    createdAt: "2024-01-17T09:15:00Z",
    updatedAt: "2024-01-17T09:15:00Z",
  },
]

class CustomerService {
  private baseUrl = API_URL;

  async getCustomers(page = 1, limit = 10, filters: CustomerFilters = {}): Promise<CustomerResponse> {
    try {
      console.log(`Obteniendo clientes - Página: ${page}, Límite: ${limit}`, filters)

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Filtrar por búsqueda
      let filteredCustomers = mockCustomers
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredCustomers = mockCustomers.filter(
          (customer) =>
            customer.nombres.toLowerCase().includes(searchLower) ||
            customer.apellidos.toLowerCase().includes(searchLower) ||
            customer.rut.toLowerCase().includes(searchLower) ||
            customer.email.toLowerCase().includes(searchLower) ||
            customer.telefono.includes(searchLower),
        )
      }

      // Ordenar
      if (filters.sortBy) {
        filteredCustomers.sort((a, b) => {
          const aValue = a[filters.sortBy as keyof Customer] as string
          const bValue = b[filters.sortBy as keyof Customer] as string

          if (filters.sortOrder === "desc") {
            return bValue.localeCompare(aValue)
          }
          return aValue.localeCompare(bValue)
        })
      }

      // Paginar
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex)

      const response: CustomerResponse = {
        customers: paginatedCustomers,
        total: filteredCustomers.length,
        page,
        limit,
        totalPages: Math.ceil(filteredCustomers.length / limit),
      }

      console.log("Respuesta de clientes:", response)
      return response
    } catch (error) {
      console.error("Error al obtener clientes:", error)
      throw new Error("Error al cargar la lista de clientes")
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    try {
      console.log(`Obteniendo cliente por ID: ${id}`)

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 300))

      const customer = mockCustomers.find((c) => c.id === id)

      if (!customer) {
        throw new Error("Cliente no encontrado")
      }

      console.log("Cliente encontrado:", customer)
      return customer
    } catch (error) {
      console.error("Error al obtener cliente:", error)
      throw error
    }
  }

  async createCustomer(customerData: CreateCustomerData): Promise<Customer> {
    try {
      console.log("Creando cliente:", customerData)

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Validar RUT único
      const existingCustomer = mockCustomers.find((c) => c.rut === customerData.rut)
      if (existingCustomer) {
        throw new Error("Ya existe un cliente con este RUT")
      }

      // Validar email único
      const existingEmail = mockCustomers.find((c) => c.email === customerData.email)
      if (existingEmail) {
        throw new Error("Ya existe un cliente con este email")
      }

      const newCustomer: Customer = {
        id: Date.now().toString(),
        ...customerData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      mockCustomers.push(newCustomer)
      console.log("Cliente creado exitosamente:", newCustomer)
      return newCustomer
    } catch (error) {
      console.error("Error al crear cliente:", error)
      throw error
    }
  }

  async updateCustomer(id: string, customerData: Partial<CreateCustomerData>): Promise<Customer> {
    try {
      console.log(`Actualizando cliente ${id}:`, customerData)

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 800))

      const customerIndex = mockCustomers.findIndex((c) => c.id === id)
      if (customerIndex === -1) {
        throw new Error("Cliente no encontrado")
      }

      // Validar RUT único (excluyendo el cliente actual)
      if (customerData.rut) {
        const existingCustomer = mockCustomers.find((c) => c.rut === customerData.rut && c.id !== id)
        if (existingCustomer) {
          throw new Error("Ya existe un cliente con este RUT")
        }
      }

      // Validar email único (excluyendo el cliente actual)
      if (customerData.email) {
        const existingEmail = mockCustomers.find((c) => c.email === customerData.email && c.id !== id)
        if (existingEmail) {
          throw new Error("Ya existe un cliente con este email")
        }
      }

      const updatedCustomer: Customer = {
        ...mockCustomers[customerIndex],
        ...customerData,
        updatedAt: new Date().toISOString(),
      }

      mockCustomers[customerIndex] = updatedCustomer
      console.log("Cliente actualizado exitosamente:", updatedCustomer)
      return updatedCustomer
    } catch (error) {
      console.error("Error al actualizar cliente:", error)
      throw error
    }
  }

  async deleteCustomer(id: string): Promise<void> {
    try {
      console.log(`Eliminando cliente: ${id}`)

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 500))

      const customerIndex = mockCustomers.findIndex((c) => c.id === id)
      if (customerIndex === -1) {
        throw new Error("Cliente no encontrado")
      }

      mockCustomers.splice(customerIndex, 1)
      console.log("Cliente eliminado exitosamente")
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      throw error
    }
  }

  async bulkDeleteCustomers(ids: string[]): Promise<void> {
    try {
      console.log("Eliminando clientes en lote:", ids)

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000))

      ids.forEach((id) => {
        const customerIndex = mockCustomers.findIndex((c) => c.id === id)
        if (customerIndex !== -1) {
          mockCustomers.splice(customerIndex, 1)
        }
      })

      console.log(`${ids.length} clientes eliminados exitosamente`)
    } catch (error) {
      console.error("Error al eliminar clientes en lote:", error)
      throw error
    }
  }

  // Método para upload de archivos
  async uploadFile(file: File): Promise<string> {
    try {
      console.log("Subiendo archivo:", file.name)

      // Simular delay de upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simular URL de archivo subido
      const fileUrl = `/uploads/customers/${Date.now()}-${file.name}`
      console.log("Archivo subido exitosamente:", fileUrl)
      return fileUrl
    } catch (error) {
      console.error("Error al subir archivo:", error)
      throw new Error("Error al subir el archivo")
    }
  }
}

export const customerService = new CustomerService()
