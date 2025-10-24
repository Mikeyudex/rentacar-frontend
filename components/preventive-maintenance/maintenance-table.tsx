"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  type SortingState,
  getSortedRowModel,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { maintenanceService } from "@/services/preventive-maintenance-service"
import { getVehicles } from "@/services/vehicle-service"
import type { PreventiveMaintenance, MaintenanceFilters } from "@/lib/preventive-maintenance-types"
import type { Vehicle } from "@/lib/vehicle-types"
import { Eye, Trash2, ArrowUpDown, Filter, Plus } from "lucide-react"

const estadoConfig = {
  pendiente: { label: "Pendiente", variant: "secondary" as const },
  en_proceso: { label: "En Proceso", variant: "default" as const },
  completada: { label: "Completada", variant: "default" as const },
  cancelada: { label: "Cancelada", variant: "destructive" as const },
}

const tipoConfig = {
  preventiva: { label: "Preventiva", className: "bg-blue-100 text-blue-800" },
  correctiva: { label: "Correctiva", className: "bg-orange-100 text-orange-800" },
}

export function MaintenanceTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [maintenance, setMaintenance] = useState<PreventiveMaintenance[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState<MaintenanceFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadVehicles()
  }, [])

  useEffect(() => {
    loadMaintenance()
  }, [pagination.pageIndex, pagination.pageSize, filters])

  const loadVehicles = async () => {
    try {
      const response = await getVehicles({ page: 1, limit: 100 })
      setVehicles(response.data)
    } catch (error) {
      console.error("Error loading vehicles:", error)
    }
  }

  const loadMaintenance = async () => {
    setIsLoading(true)
    try {
      const response = await maintenanceService.getMaintenance(pagination.pageIndex + 1, pagination.pageSize, filters)
      setMaintenance(response.data)
      setTotalPages(response.totalPages)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las mantenciones",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta mantención?")) {
      return
    }

    try {
      await maintenanceService.deleteMaintenance(id)
      toast({
        title: "Éxito",
        description: "Mantención eliminada correctamente",
      })
      loadMaintenance()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la mantención",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<PreventiveMaintenance>[] = [
    {
      accessorKey: "otNumero",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          N° OT
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-mono font-medium">{row.getValue("otNumero")}</div>,
    },
    {
      accessorKey: "vehiculoPatente",
      header: "Vehículo",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.vehiculoPatente}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.vehiculoMarca} {row.original.vehiculoModelo}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "fecha",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Fecha
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("fecha"))
        return date.toLocaleDateString("es-CL")
      },
    },
    {
      accessorKey: "tipoMantencion",
      header: "Tipo",
      cell: ({ row }) => {
        const tipo = row.getValue("tipoMantencion") as keyof typeof tipoConfig
        const config = tipoConfig[tipo]
        return <Badge className={config.className}>{config.label}</Badge>
      },
    },
    {
      accessorKey: "kilometraje",
      header: "Kilometraje",
      cell: ({ row }) => <div>{row.getValue<number>("kilometraje").toLocaleString("es-CL")} km</div>,
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">${row.getValue<number>("total").toLocaleString("es-CL")}</div>,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as keyof typeof estadoConfig
        const config = estadoConfig[estado]
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const maintenance = row.original
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/mantenciones/${maintenance.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(maintenance.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: maintenance,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    manualPagination: true,
    pageCount: totalPages,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
        <Button onClick={() => router.push("/preventive-maintenance/crear")} className="flex items-center gap-2">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Mantención
        </Button>
      </div>


      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehículo</label>
            <Select
              value={filters.vehiculoId || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, vehiculoId: value === "all" ? undefined : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los vehículos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vehículos</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.patente} - {vehicle.marca} {vehicle.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={filters.tipoMantencion || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  tipoMantencion: value === "all" ? undefined : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="preventiva">Preventiva</SelectItem>
                <SelectItem value="correctiva">Correctiva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select
              value={filters.estado || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({ ...prev, estado: value === "all" ? undefined : value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron mantenciones.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filas por página:</span>
          <Select
            value={pagination.pageSize.toString()}
            onValueChange={(value) => setPagination((prev) => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {pagination.pageIndex + 1} de {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
