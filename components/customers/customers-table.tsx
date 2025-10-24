"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Customer, CustomerFilters } from "@/lib/customer-types"
import { customerService } from "@/services/customer-service"
import { DataTable } from "@/components/ui/data-table"
import type { DataTableColumn } from "@/lib/data-table-types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Eye, Edit, Trash2, Plus, Mail, Phone, MapPin, User, MoreHorizontal, Pencil } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"

export default function CustomersTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const filters: CustomerFilters = {
        search: searchTerm || undefined,
        sortBy: sortBy || undefined,
        sortOrder,
      }

      const response = await customerService.getCustomers(currentPage, pageSize, filters)
      setCustomers(response.customers)
      setTotalItems(response.total)
    } catch (error) {
      toast({
        title: "Error al cargar clientes",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder])

  const handleView = (customer: Customer) => {
    router.push(`/clientes/${customer.id}`)
  }

  const handleEdit = (customer: Customer) => {
    router.push(`/clientes/${customer.id}/editar`)
  }

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return

    setIsDeleting(true)
    try {
      await customerService.deleteCustomer(customerToDelete.id)
      toast({
        title: "Cliente eliminado",
        description: `${customerToDelete.nombres} ${customerToDelete.apellidos} ha sido eliminado correctamente`,
      })
      await loadCustomers()
    } catch (error) {
      toast({
        title: "Error al eliminar cliente",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  // Calcular datos paginados
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCustomers = customers.slice(startIndex, startIndex + pageSize);

  const columns: DataTableColumn<Customer>[] = [
    {
      id: "nombres",
      header: "Nombres",
      accessorKey: "nombres",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.nombres}</span>
        </div>
      ),
    },
    {
      id: "apellidos",
      header: "Apellidos",
      accessorKey: "apellidos",
      cell: (row) => <span className="font-medium">{row.apellidos}</span>,
    },
    {
      id: "rut",
      header: "RUT",
      accessorKey: "rut",
      cell: (row) => (
        <Badge variant="outline" className="font-mono">
          {row.rut}
        </Badge>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{row.email}</span>
        </div>
      ),
    },
    {
      id: "telefono",
      header: "Teléfono",
      accessorKey: "telefono",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="font-mono text-sm">{row.telefono}</span>
        </div>
      ),
    },
    {
      id: "direccion",
      header: "Dirección",
      accessorKey: "direccion",
      cell: (row) => (
        <div className="flex items-center gap-2 max-w-[200px]">
          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="text-sm truncate" title={row.direccion}>
            {row.direccion}
          </span>
        </div>
      ),
    },
    {
      id: "createdAt",
      header: "Fecha de Registro",
      accessorKey: "createdAt",
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.createdAt).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(row)}
            className="h-8 w-8 p-0"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEdit(row)} className="h-8 w-8 p-0" title="Editar">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteClick(row)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];


  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => router.push("/clientes/crear")} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Crear Cliente
        </Button>
      </div>

      <DataTable
        columns={columns as DataTableColumn<Record<string, any>>[]}
        data={customers}
        isLoading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(column, order) => {
          setSortBy(column)
          setSortOrder(order)
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
              <strong>
                {customerToDelete?.nombres} {customerToDelete?.apellidos}
              </strong>{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
