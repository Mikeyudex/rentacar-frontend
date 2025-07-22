"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { register } from "@/services/auth-service"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Eye, EyeOff, User, Mail, FileText, Lock, Users } from "lucide-react"
import Link from "next/link"
import type { RegisterData } from "@/lib/auth-types"

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    documento: "",
    password: "",
    nombre: "",
    apellido: "",
    rol: "operativo",
  })

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) return

    // Validaciones básicas
    if (!formData.email || !formData.password || !formData.nombre || !formData.apellido || !formData.documento) {
      toast({
        title: "Error de validación",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error de validación",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast({
        title: "Error de validación",
        description: "Por favor ingrese un email válido",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await register(formData)

      if (response.success) {
        toast({
          title: "¡Registro exitoso!",
          description: response.message,
          variant: "default",
        })

        // Redirigir al login después de un breve delay
        setTimeout(() => {
          router.push("/login")
        }, 1500)
      }
    } catch (error) {
      console.error("Error en registro:", error)
      toast({
        title: "Error en el registro",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>Ingrese sus datos para registrarse en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre
              </Label>
              <Input
                id="nombre"
                type="text"
                placeholder="Ingrese su nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Apellido */}
            <div className="space-y-2">
              <Label htmlFor="apellido" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Apellido
              </Label>
              <Input
                id="apellido"
                type="text"
                placeholder="Ingrese su apellido"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Documento */}
            <div className="space-y-2">
              <Label htmlFor="documento" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documento
              </Label>
              <Input
                id="documento"
                type="text"
                placeholder="Número de documento"
                value={formData.documento}
                onChange={(e) => handleInputChange("documento", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Rol */}
            <div className="space-y-2">
              <Label htmlFor="rol" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Rol
              </Label>
              <Select
                value={formData.rol}
                onValueChange={(value: "admin" | "operativo") => handleInputChange("rol", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operativo">Operativo</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botón de registro */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Registrando...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>

            {/* Link al login */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Iniciar Sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
