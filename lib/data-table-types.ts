import type { ReactNode } from "react"

// Tipos para el DataTable
export interface DataTableColumn<T> {
  id: string
  header: string | ReactNode
  accessorKey?: keyof T
  cell?: (row: T) => ReactNode
  sortable?: boolean
  filterable?: boolean
  hideable?: boolean
  size?: number
  align?: "left" | "center" | "right"
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  searchPlaceholder?: string
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  // Paginación
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  // Búsqueda
  searchTerm: string
  onSearchChange: (term: string) => void
  // Ordenamiento
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSortChange?: (column: string, order: "asc" | "desc") => void
  // Acciones
  actions?: (row: T) => ReactNode
}

export interface DataTableState {
  columnVisibility: Record<string, boolean>
  sorting: { id: string; desc: boolean }[]
}
