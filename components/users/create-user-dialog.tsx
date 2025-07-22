"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, User, Mail, FileText, Lock, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useLoading } from "@/hooks/use-loading"

import type { CreateUserData } from "@/lib/user-types"
import { createUser } from "@/services/user-service";

interface CreateUserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onUserCreated: () => void
}

export function CreateUserDialog({ open, onOpenChange, onUserCreated }: CreateUserDialogProps) {
    const [formData, setFormData] = useState<CreateUserData>({
        email: "",
        documento: "",
        password: "",
        nombre: "",
        apellido: "",
        rol: "operativo",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState<Partial<CreateUserData>>({})
    const { toast } = useToast()
    const loading = useLoading({
        defaultTitle: "Procesando...",
        autoHide: true,
        autoHideDelay: 2000,
    })

    const validateForm = (): boolean => {
        const newErrors: Partial<CreateUserData> = {}

        if (!formData.email) {
            newErrors.email = "El email es obligatorio"
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "El email no es válido"
        }

        if (!formData.documento) {
            newErrors.documento = "El documento es obligatorio"
        }

        if (!formData.password) {
            newErrors.password = "La contraseña es obligatoria"
        } else if (formData.password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres"
        }

        if (!formData.nombre) {
            newErrors.nombre = "El nombre es obligatorio"
        }

        if (!formData.apellido) {
            newErrors.apellido = "El apellido es obligatorio"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        try {
            loading.showLoading()
            await createUser(formData)

            toast({
                title: "Éxito",
                description: "Usuario creado correctamente",
            })

            // Resetear formulario
            setFormData({
                email: "",
                documento: "",
                password: "",
                nombre: "",
                apellido: "",
                rol: "operativo",
            })
            setErrors({})

            onUserCreated()
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Error al crear usuario",
                variant: "destructive",
            })
        } finally {
            loading.hideLoading()
        }
    }

    const handleInputChange = (field: keyof CreateUserData, value: string) => {
        setFormData({ ...formData, [field]: value })
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>Completa los datos para crear un nuevo usuario en el sistema.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="nombre"
                                    type="text"
                                    placeholder="Ingresa el nombre"
                                    value={formData.nombre}
                                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {errors.nombre && <p className="text-sm text-red-600">{errors.nombre}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apellido">Apellido</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="apellido"
                                    type="text"
                                    placeholder="Ingresa el apellido"
                                    value={formData.apellido}
                                    onChange={(e) => handleInputChange("apellido", e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            {errors.apellido && <p className="text-sm text-red-600">{errors.apellido}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="usuario@ejemplo.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="documento">Documento</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="documento"
                                type="text"
                                placeholder="Número de documento"
                                value={formData.documento}
                                onChange={(e) => handleInputChange("documento", e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        {errors.documento && <p className="text-sm text-red-600">{errors.documento}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Contraseña</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 6 caracteres"
                                value={formData.password}
                                onChange={(e) => handleInputChange("password", e.target.value)}
                                className="pl-10 pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </div>
                        {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rol">Rol</Label>
                        <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                            <Select
                                value={formData.rol}
                                onValueChange={(value: "admin" | "operativo") => handleInputChange("rol", value)}
                            >
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Selecciona un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="operativo">Operativo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading.isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading.isLoading}>
                            {loading.isLoading ? "Creando..." : "Crear Usuario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
