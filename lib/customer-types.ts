export interface Customer {
  id: string
  nombres: string
  apellidos: string
  rut: string
  direccion: string
  email: string
  telefono: string
  fotoCi?: string
  fotoLicencia?: string
  hojaAntecedentes?: string
  hojaConductor?: string
  eRut?: string
  contratoUrl: string
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerData {
  nombres: string
  apellidos: string
  rut: string
  direccion: string
  email: string
  telefono: string
  fotoCi?: string
  fotoLicencia?: string
  hojaAntecedentes?: string
  hojaConductor?: string
  eRut?: string
  contratoUrl: string
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string
}

export interface CustomerFilters {
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface CustomerResponse {
  customers: Customer[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BulkDeleteRequest {
  ids: string[]
}
