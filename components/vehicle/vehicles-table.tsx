"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Eye, Car, MoreHorizontal, Pencil, Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import type { DataTableColumn } from "@/lib/data-table-types"
import type { UpdateVehicleData, Vehicle } from "@/lib/vehicle-types"
import { getVehicles, deleteVehicle, updateVehicle } from "@/services/vehicle-service"
import { useLoading } from "@/hooks/use-loading"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import { DropdownMenuItem } from "../ui/dropdown-menu"

export function VehiclesTable() {
    const router = useRouter()
    const { toast } = useToast()
    const { isLoading, hideLoading, showLoading } = useLoading()
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
    const [editingVehicle, setEditingVehicle] = useState<string | null>(null)
    const [editData, setEditData] = useState<Partial<Vehicle>>({})
    const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null)
    const [totalItems, setTotalItems] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<string>("")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    // Cargar vehículos
    const loadVehicles = async (page = 1, limit = 10, search = "") => {
        showLoading()
        try {
            const response = await getVehicles({
                page,
                limit,
                search,
                sortBy: "patente",
                sortOrder: "asc",
            })
            setVehicles(response.data)
            setTotalItems(response.meta.totalItems)
            setCurrentPage(response.meta.currentPage)
        } catch (error) {
            console.error("Error al cargar vehículos:", error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los vehículos",
                variant: "destructive",
            })
        } finally {
            hideLoading()
        }
    }

    // Cargar datos iniciales
    useEffect(() => {
        loadVehicles(currentPage, pageSize, searchTerm)
    }, [currentPage, pageSize, searchTerm])

    // Manejar eliminación
    const handleDelete = async (vehicle: Vehicle) => {
        const confirmed = window.confirm(`¿Está seguro de que desea eliminar el vehículo con patente ${vehicle.patente}?`)

        if (!confirmed) return

        try {
            const response = await deleteVehicle(vehicle.id)

            if (response.success) {
                toast({
                    title: "¡Éxito!",
                    description: response.message,
                    duration: 3000,
                })

                // Recargar la lista
                loadVehicles(currentPage, pageSize, searchTerm)
            } else {
                toast({
                    title: "Error",
                    description: response.message,
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Error al eliminar vehículo:", error)
            toast({
                title: "Error",
                description: "No se pudo eliminar el vehículo",
                variant: "destructive",
            })
        }
    }

    const handleEdit = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle.id)
        setEditData({
            patente: vehicle.patente,
            marca: vehicle.marca,
            modelo: vehicle.modelo,
            numMotor: vehicle.numMotor,
            numVin: vehicle.numVin,
            color: vehicle.color,
            fechaCreacion: vehicle.fechaCreacion,
            fechaActualizacion: vehicle.fechaActualizacion,
        })
    }

    const handleSaveEdit = async (vehicleId: string) => {
        try {
            showLoading()
            const updateData: UpdateVehicleData = {
                id: vehicleId,
                ...editData,
            }

            const response = await updateVehicle(updateData)
            const updatedVehicle = response.data!

            setVehicles(vehicles.map((vehicle) => (vehicle.id === vehicleId ? updatedVehicle : vehicle)))

            setEditingVehicle(null)
            setEditData({})

            toast({
                title: "Éxito",
                description: "Vehículo actualizado correctamente",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al actualizar vehículo",
                variant: "destructive",
            })
        } finally {
            hideLoading()
        }
    }

    const handleCancelEdit = () => {
        setEditingVehicle(null)
        setEditData({})
    }

    // Calcular datos paginados
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedUsers = vehicles.slice(startIndex, startIndex + pageSize)

    // Definir columnas de la tabla
    const columns: DataTableColumn<Vehicle>[] = [
        {
            id: "patente",
            header: "Patente",
            accessorKey: "patente",
            sortable: true,
            cell: (vehicle) => <div className="font-medium">{vehicle.patente}</div>,
        },
        {
            id: "marca",
            accessorKey: "marca",
            header: "Marca",
            sortable: true,
            cell: (vehicle) => <div>{vehicle.marca}</div>,
        },
        {
            id: "modelo",
            accessorKey: "modelo",
            header: "Modelo",
            sortable: true,
            cell: (vehicle) => <div>{vehicle.modelo}</div>,
        },
        {
            id: "color",
            accessorKey: "color",
            header: "Color",
            cell: (vehicle) => <Badge variant="outline">{vehicle.color}</Badge>,
        },
        {
            id: "numMotor",
            accessorKey: "numMotor",
            header: "N° Motor",
            cell: (vehicle) => <div className="font-mono text-sm">{vehicle.numMotor}</div>,
        },
        {
            id: "numVin",
            accessorKey: "numVin",
            header: "N° VIN",
            cell: (vehicle) => <div className="font-mono text-sm">{vehicle.numVin}</div>,
        },
        {
            id: "fechaCreacion",
            accessorKey: "fechaCreacion",
            header: "Fecha Creación",
            sortable: true,
            cell: (vehicle) => (
                <div className="text-sm text-muted-foreground">
                    {new Date(vehicle.fechaCreacion).toLocaleDateString("es-ES")}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Acciones",
            cell: (vehicle) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/vehiculos/${vehicle.id}`)}>
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/vehiculos/${vehicle.id}/editar`)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(vehicle)}
                        className="text-destructive hover:text-destructive"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ),
        },
    ]

    // Función para renderizar acciones
    const renderActions = (vehicle: Vehicle) => {
        const isEditing = editingVehicle === vehicle.id

        if (isEditing) {
            return (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(vehicle.id)} disabled={isLoading}>
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isLoading}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )
        }

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteVehicleId(vehicle.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Car className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">Vehículos</h2>
                </div>
                <Button onClick={() => router.push("/vehiculos/crear")}>Crear Vehículo</Button>
            </div>

            <DataTable
                columns={columns as DataTableColumn<Record<string, any>>[]}
                data={vehicles}
                searchPlaceholder="Buscar por patente, marca, modelo..."
                isLoading={isLoading}
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
                actions={renderActions}
            />
        </div>
    )
}
