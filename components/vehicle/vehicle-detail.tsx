"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Car, Edit, Trash2, FileText, Info, Calendar, Hash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { getVehicleById, deleteVehicle } from "@/services/vehicle-service"
import type { Vehicle } from "@/lib/vehicle-types"

interface VehicleDetailProps {
  vehicleId: string
}

export function VehicleDetail({ vehicleId }: VehicleDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadVehicle()
  }, [vehicleId])

  const loadVehicle = async () => {
    try {
      setIsLoading(true)
      const vehicleData = await getVehicleById(vehicleId)

      if (vehicleData) {
        setVehicle(vehicleData)
      } else {
        toast({
          title: "Error",
          description: "Vehículo no encontrado",
          variant: "destructive",
        })
        router.push("/vehiculos")
      }
    } catch (error) {
      console.error("Error al cargar vehículo:", error)
      toast({
        title: "Error",
        description: "Error al cargar la información del vehículo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!vehicle) return

    const confirmed = window.confirm(`¿Está seguro de que desea eliminar el vehículo con patente ${vehicle.patente}?`)

    if (!confirmed) return

    try {
      setIsDeleting(true)
      const response = await deleteVehicle(vehicle.id)

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: response.message,
        })
        router.push("/vehiculos")
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
        description: "Error al eliminar el vehículo",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = () => {
    router.push(`/vehiculos/${vehicleId}/editar`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Vehículo no encontrado</h2>
          <p className="text-muted-foreground mb-4">El vehículo que busca no existe o ha sido eliminado</p>
          <Button onClick={() => router.push("/vehiculos")}>Volver a la lista</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-6 w-6" />
              <h1 className="text-3xl font-bold">Detalle del Vehículo</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-lg px-3 py-1">
                {vehicle.patente}
              </Badge>
              <span className="text-muted-foreground">
                {vehicle.marca} {vehicle.modelo}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEdit} variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button onClick={handleDelete} variant="destructive" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Información Básica
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        {/* Información Básica */}
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Vehículo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Datos del Vehículo
                </CardTitle>
                <CardDescription>Información principal del vehículo registrado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Patente</label>
                    <p className="text-lg font-mono font-semibold">{vehicle.patente}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Color</label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{vehicle.color}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marca</label>
                    <p className="text-lg font-semibold">{vehicle.marca}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                    <p className="text-lg font-semibold">{vehicle.modelo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Números de Identificación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Números de Identificación
                </CardTitle>
                <CardDescription>Números únicos de identificación del vehículo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número de Motor</label>
                  <p className="text-lg font-mono bg-muted p-2 rounded border">{vehicle.numMotor}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Número VIN</label>
                  <p className="text-lg font-mono bg-muted p-2 rounded border">{vehicle.numVin}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información de Registro */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información de Registro
              </CardTitle>
              <CardDescription>Fechas de creación y última actualización</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                  <p className="text-base">{formatDate(vehicle.fechaCreacion)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                  <p className="text-base">{formatDate(vehicle.fechaActualizacion)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentos */}
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos del Vehículo
              </CardTitle>
              <CardDescription>Documentación legal y técnica del vehículo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Funcionalidad en Desarrollo</h3>
                <p className="text-muted-foreground mb-4">La gestión de documentos estará disponible próximamente</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Certificado de inscripción</p>
                  <p>• Revisión técnica</p>
                  <p>• Seguro obligatorio</p>
                  <p>• Permisos de circulación</p>
                  <p>• Documentos adicionales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
