"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { useToast } from "@/hooks/use-toast"

import { getCategoriesPaginated, deleteCategory } from "@/services/category-service"
import type { Category } from "@/lib/types"
import type { DataTableColumn } from "@/lib/data-table-types"

export function CategoriesDataTable() {
  // Estados para el DataTable
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Estados para búsqueda y ordenamiento
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const { toast } = useToast()

  // Efecto para debounce de la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Resetear a la primera página cuando se busca
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Efecto para cargar las categorías
  useEffect(() => {
    async function loadCategories() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getCategoriesPaginated({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchTerm,
          sortBy,
          sortOrder,
        })

        setCategories(response.data)
        setTotalPages(response.meta.totalPages)
        setTotalItems(response.meta.totalItems)
      } catch (err) {
        setError("Error al cargar las categorías. Intente nuevamente.")
        toast({
          title: "Error",
          description: "No se pudieron cargar las categorías",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [currentPage, pageSize, debouncedSearchTerm, sortBy, sortOrder, toast])

  // Función para manejar la eliminación de una categoría
  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)

      // Recargar la página actual
      const response = await getCategoriesPaginated({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm,
        sortBy,
        sortOrder,
      })

      setCategories(response.data)
      setTotalPages(response.meta.totalPages)
      setTotalItems(response.meta.totalItems)

      // Si eliminamos el último elemento de la página, ir a la página anterior
      if (response.data.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }

      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada correctamente",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
  }

  // Función para manejar el cambio de ordenamiento
  const handleSortChange = (column: string, order: "asc" | "desc") => {
    setSortBy(column)
    setSortOrder(order)
  }

  // Función para reintentar la carga
  const handleRetry = () => {
    setCurrentPage(1)
    setError(null)
    setIsLoading(true)
  }

  // Definir las columnas del DataTable
  const columns: DataTableColumn<Category>[] = [
    {
      id: "name",
      header: "Nombre",
      accessorKey: "name",
      sortable: true,
      filterable: true,
      cell: (category) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline">{category.name}</Badge>
        </div>
      ),
    },
    {
      id: "slug",
      header: "Slug",
      accessorKey: "slug",
      sortable: true,
      filterable: true,
      cell: (category) => <code className="text-sm bg-muted px-2 py-1 rounded">{category.slug}</code>,
    },
    {
      id: "id",
      header: "ID",
      accessorKey: "id",
      sortable: true,
      size: 100,
      cell: (category) => <span className="text-muted-foreground text-sm">{category.id}</span>,
    },
  ]

  // Función para renderizar las acciones de cada fila
  const renderActions = (category: Category) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCategory(category.id)}>
          <Trash className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <DataTable
      data={categories}
      columns={columns}
      searchPlaceholder="Buscar categorías..."
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size:any) => {
        setPageSize(size)
        setCurrentPage(1)
      }}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSortChange={handleSortChange}
      actions={renderActions}
    />
  )
}
