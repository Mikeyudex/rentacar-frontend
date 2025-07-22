// Tipos para reportes
export interface ProductCreationReport {
  id: string
  userId: string
  userName: string
  userEmail: string
  date: string // YYYY-MM-DD
  productsCreated: number
  productsList: {
    id: string
    name: string
    sku: string
    createdAt: string
  }[]
}

export interface ReportFilters {
  userId?: string
  startDate?: string
  endDate?: string
  page: number
  limit: number
}

export interface ReportSummary {
  totalProducts: number
  totalUsers: number
  averageProductsPerDay: number
  mostActiveUser: {
    id: string
    name: string
    totalProducts: number
  }
  dateRange: {
    startDate: string
    endDate: string
  }
}

export interface ReportResponse {
  data: ProductCreationReport[]
  summary: ReportSummary
  meta: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

// Tipos para usuarios (para el filtro)
export interface ReportUser {
  id: string
  name: string
  email: string
  role: string
}
