"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Pencil, Trash2, Check, X, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { DataTable } from "@/components/ui/data-table"
import { useToast } from "@/hooks/use-toast"
import { useLoading } from "@/hooks/use-loading"

import type { UserData, UpdateUserData } from "@/lib/user-types"
import type { DataTableColumn } from "@/lib/data-table-types"
import { getUsers, updateUser, deleteUser } from "@/services/user-service"

interface UsersTableProps {
    onCreateUser: () => void
}

export function UsersTable({ onCreateUser }: UsersTableProps) {
    const [users, setUsers] = useState<UserData[]>([])
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
    const [editingUser, setEditingUser] = useState<string | null>(null)
    const [editData, setEditData] = useState<Partial<UserData>>({})
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)

    // Estados para el DataTable
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState<string>("")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

    const { toast } = useToast()
    const loading = useLoading({
        defaultTitle: "Procesando...",
        autoHide: true,
        autoHideDelay: 2000,
    })

    // Cargar usuarios al montar el componente
    useEffect(() => {
        loadUsers()
    }, [])

    // Filtrar y ordenar usuarios
    useEffect(() => {
        const filtered = users.filter(
            (user) =>
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.documento.includes(searchTerm),
        )

        // Ordenamiento
        if (sortBy) {
            filtered.sort((a, b) => {
                const aValue = a[sortBy as keyof UserData]
                const bValue = b[sortBy as keyof UserData]

                if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
                if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
                return 0
            })
        }

        setFilteredUsers(filtered)
        setCurrentPage(1) // Reset a primera página cuando cambia el filtro
    }, [users, searchTerm, sortBy, sortOrder])

    const loadUsers = async () => {
        try {
            loading.showLoading()
            const usersData = await getUsers()
            setUsers(usersData)
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudieron cargar los usuarios",
                variant: "destructive",
            })
        } finally {
            loading.hideLoading()
        }
    }

    const handleEdit = (user: UserData) => {
        setEditingUser(user.id)
        setEditData({
            email: user.email,
            documento: user.documento,
            nombre: user.nombre,
            apellido: user.apellido,
            rol: user.rol
        })
    }

    const handleSaveEdit = async (userId: string) => {
        try {
            loading.showLoading()
            const updateData: UpdateUserData = {
                id: userId,
                ...editData,
            }

            const updatedUser = await updateUser(updateData)

            setUsers(users.map((user) => (user.id === userId ? updatedUser : user)))

            setEditingUser(null)
            setEditData({})

            toast({
                title: "Éxito",
                description: "Usuario actualizado correctamente",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al actualizar usuario",
                variant: "destructive",
            })
        } finally {
            loading.hideLoading()
        }
    }

    const handleCancelEdit = () => {
        setEditingUser(null)
        setEditData({})
    }

    const handleDelete = async (userId: string) => {
        try {
            loading.showLoading()
            await deleteUser(userId)
            setUsers(users.filter((user) => user.id !== userId))
            setDeleteUserId(null)

            toast({
                title: "Éxito",
                description: "Usuario eliminado correctamente",
            })
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al eliminar usuario",
                variant: "destructive",
            })
        } finally {
            loading.hideLoading()
        }
    }

    // Calcular datos paginados
    const totalItems = filteredUsers.length
    const totalPages = Math.ceil(totalItems / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)

    // Definir columnas para el DataTable
    const columns: DataTableColumn<UserData>[] = [
        {
            id: "email",
            header: "Email",
            accessorKey: "email",
            sortable: true,
            cell: (user) => {
                const isEditing = editingUser === user.id

                if (isEditing) {
                    return (
                        <Input
                            value={editData.email || ""}
                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            className="h-8"
                        />
                    )
                }

                return <div className="font-medium">{user.email}</div>
            },
        },
        {
            id: "documento",
            header: "Documento",
            accessorKey: "documento",
            sortable: true,
            cell: (user) => {
                const isEditing = editingUser === user.id

                if (isEditing) {
                    return (
                        <Input
                            value={editData.documento || ""}
                            onChange={(e) => setEditData({ ...editData, documento: e.target.value })}
                            className="h-8"
                        />
                    )
                }

                return <div>{user.documento}</div>
            },
        },
        {
            id: "nombre",
            header: "Nombre",
            accessorKey: "nombre",
            sortable: true,
            cell: (user) => {
                const isEditing = editingUser === user.id

                if (isEditing) {
                    return (
                        <Input
                            value={editData.nombre || ""}
                            onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                            className="h-8"
                        />
                    )
                }

                return <div>{user.nombre}</div>
            },
        },
        {
            id: "apellido",
            header: "Apellido",
            accessorKey: "apellido",
            sortable: true,
            cell: (user) => {
                const isEditing = editingUser === user.id

                if (isEditing) {
                    return (
                        <Input
                            value={editData.apellido || ""}
                            onChange={(e) => setEditData({ ...editData, apellido: e.target.value })}
                            className="h-8"
                        />
                    )
                }

                return <div>{user.apellido}</div>
            },
        },
        {
            id: "rol",
            header: "Rol",
            accessorKey: "rol",
            sortable: true,
            cell: (user) => {
                const isEditing = editingUser === user.id

                if (isEditing) {
                    return (
                        <Select
                            value={editData.rol || user.rol}
                            onValueChange={(value: "admin" | "operativo") => setEditData({ ...editData, rol: value })}
                        >
                            <SelectTrigger className="h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="operativo">Operativo</SelectItem>
                            </SelectContent>
                        </Select>
                    )
                }

                return (
                    <Badge variant={user.rol === "admin" ? "default" : "secondary"}>
                        {user.rol === "admin" ? "Admin" : "Operativo"}
                    </Badge>
                )
            },
        },
    ]

    // Función para renderizar acciones
    const renderActions = (user: UserData) => {
        const isEditing = editingUser === user.id

        if (isEditing) {
            return (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(user.id)} disabled={loading.isLoading}>
                        <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} disabled={loading.isLoading}>
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
                    <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDeleteUserId(user.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h2>
                    <p className="text-muted-foreground">Administra los usuarios del sistema</p>
                </div>
                <Button onClick={onCreateUser}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Usuario
                </Button>
            </div>

            <DataTable
                data={paginatedUsers}
                columns={columns}
                searchPlaceholder="Buscar usuarios..."
                isLoading={loading.isLoading}
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

            <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteUserId && handleDelete(deleteUserId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
