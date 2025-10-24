"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { maintenanceService } from "@/services/maintenance-service"
import type { Maintenance } from "@/lib/preventive-maintenance-types"
import { Wrench, Calendar, MapPin, FileText, DollarSign, Trash2, Loader2 } from "lucide-react"

const estadoConfig = {
  pendiente: { label: "Pendiente", variant: "secondary" as const },
  en_proceso: { label: "En Proceso", variant: "default" as const },
  completada: { label: "Completada", variant: "default" as const },
  cancelada: { label: "Cancelada", variant: "destructive" as const },
}

interface MaintenanceDetailProps {
  maintenanceId: string
}

export function MaintenanceDetail({ maintenanceId }: MaintenanceDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [maintenance, setMaintenance] = useState<Maintenance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    loadMaintenance()
  }, [maintenanceId])

  const loadMaintenance = async () => {
    setIsLoading(true)
    try {
      const data = await maintenanceService.getMaintenanceById(maintenanceId)
      setMaintenance(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la mantención",
        variant: "destructive",
      })
      router.push("/mantenciones")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: Maintenance["estado"]) => {
    if (!maintenance) return

    setIsUpdatingStatus(true)
    try {
      await maintenanceService.updateMaintenanceStatus(maintenance.id, newStatus)
      toast({
        title: "Éxito",
        description: "Estado actualizado correctamente",
      })
      loadMaintenance()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!maintenance) return

    if (!confirm("¿Está seguro de eliminar esta mantención?")) {
      return
    }

    try {
      await maintenanceService.deleteMaintenance(maintenance.id)
      toast({
        title: "Éxito",
        description: "Mantención eliminada correctamente",
      })
      router.push("/mantenciones")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la mantención",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!maintenance) {
    return null
  }

  const estadoActual = estadoConfig[maintenance.estado]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orden de Trabajo: {maintenance.otNumero}</h2>
          <p className="text-muted-foreground">Detalles de la mantención {maintenance.tipoMantencion}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Información de la Mantención
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
                <p className="text-lg font-semibold">{maintenance.vehiculoPatente}</p>
                <p className="text-sm text-muted-foreground">
                  {maintenance.vehiculoMarca} {maintenance.vehiculoModelo}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={estadoActual.variant}>{estadoActual.label}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                  <p>{new Date(maintenance.fecha).toLocaleDateString("es-CL")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Kilometraje</p>
                  <p>{maintenance.kilometraje.toLocaleString("es-CL")} km</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Tipo de Mantención</p>
              <Badge
                className={
                  maintenance.tipoMantencion === "preventiva"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-orange-100 text-orange-800"
                }
              >
                {maintenance.tipoMantencion === "preventiva" ? "Preventiva" : "Correctiva"}
              </Badge>
            </div>

            {maintenance.observaciones && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Observaciones</p>
                <p className="text-sm bg-muted p-3 rounded-md">{maintenance.observaciones}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cambiar Estado
            </CardTitle>
            <CardDescription>Actualice el estado de la orden de trabajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={maintenance.estado} onValueChange={handleStatusChange} disabled={isUpdatingStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Creado:</strong> {new Date(maintenance.creadoEn).toLocaleString("es-CL")}
              </p>
              <p>
                <strong>Última actualización:</strong> {new Date(maintenance.actualizadoEn).toLocaleString("es-CL")}
              </p>
              {maintenance.creadoPor && (
                <p>
                  <strong>Creado por:</strong> {maintenance.creadoPor}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Detalle de Costos - OT {maintenance.otNumero}
          </CardTitle>
          <CardDescription>Items incluidos en esta orden de trabajo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Descripción</th>
                  <th className="text-right p-3 font-medium">Cantidad</th>
                  <th className="text-right p-3 font-medium">Precio Unitario</th>
                  <th className="text-right p-3 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.descripcion}</td>
                    <td className="text-right p-3">{item.cantidad}</td>
                    <td className="text-right p-3">${item.costo.toLocaleString("es-CL")}</td>
                    <td className="text-right p-3 font-medium">${item.subtotal.toLocaleString("es-CL")}</td>
                  </tr>
                ))}
                <tr className="border-t bg-muted">
                  <td colSpan={3} className="text-right p-3 font-bold">
                    Total:
                  </td>
                  <td className="text-right p-3 font-bold text-lg">${maintenance.total.toLocaleString("es-CL")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
