"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { maintenanceService } from "@/services/preventive-maintenance-service"
import { getVehicles } from "@/services/vehicle-service"
import type { MaintenanceFormData, PreventiveMaintenanceItem } from "@/lib/preventive-maintenance-types"
import type { Vehicle } from "@/lib/vehicle-types"
import { ArrowLeft, Plus, Trash2, Wrench } from "lucide-react"

export function MaintenanceForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const [formData, setFormData] = useState<MaintenanceFormData>({
    vehiculoId: "",
    fecha: new Date().toISOString().split("T")[0],
    tipoMantencion: "preventiva",
    kilometraje: 0,
    observaciones: "",
    items: [],
  })

  const [newItem, setNewItem] = useState<PreventiveMaintenanceItem>({
    descripcion: "",
    costo: 0,
    cantidad: 1,
    subtotal: 0,
  })

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {

      const response = await getVehicles({ page: 1, limit: 100 })
      setVehicles(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive",
      })
    }
  }

  const handleVehicleChange = (vehiculoId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehiculoId)
    setSelectedVehicle(vehicle || null)
    setFormData((prev) => ({ ...prev, vehiculoId }))
  }

  const handleAddItem = () => {
    if (!newItem.descripcion || newItem.costo <= 0) {
      toast({
        title: "Error",
        description: "Complete la descripción y el costo del item",
        variant: "destructive",
      })
      return
    }

    const item: PreventiveMaintenanceItem = {
      ...newItem,
      subtotal: newItem.costo * newItem.cantidad,
    }

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }))

    setNewItem({
      descripcion: "",
      costo: 0,
      cantidad: 1,
      subtotal: 0,
    })
  }

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.vehiculoId) {
      toast({
        title: "Error",
        description: "Seleccione un vehículo",
        variant: "destructive",
      })
      return
    }

    if (formData.items.length === 0) {
      toast({
        title: "Error",
        description: "Agregue al menos un item a la mantención",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await maintenanceService.createMaintenance(formData)

      toast({
        title: "Éxito",
        description: "Mantención creada correctamente",
      })

      router.push("/mantenciones")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la mantención",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Crear mantención preventiva</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Información de la Mantención
            </CardTitle>
            <CardDescription>Complete los datos de la mantención preventiva</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehiculoId">Vehículo *</Label>
                <Select value={formData.vehiculoId} onValueChange={handleVehicleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.patente} - {vehicle.marca} {vehicle.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fecha: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoMantencion">Tipo de Mantención *</Label>
                <Select
                  value={formData.tipoMantencion}
                  onValueChange={(value: "preventiva" | "correctiva") =>
                    setFormData((prev) => ({ ...prev, tipoMantencion: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preventiva">Preventiva</SelectItem>
                    <SelectItem value="correctiva">Correctiva</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kilometraje">Kilometraje *</Label>
                <Input
                  id="kilometraje"
                  type="number"
                  value={formData.kilometraje || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, kilometraje: Number.parseInt(e.target.value) || 0 }))
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData((prev) => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items de la Mantención</CardTitle>
            <CardDescription>Agregue los servicios y repuestos incluidos en la mantención</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={newItem.descripcion}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Ej: Filtro aceite"
                />
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="costo">Costo</Label>
                <Input
                  id="costo"
                  type="number"
                  value={newItem.costo || ""}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, costo: Number.parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  value={newItem.cantidad || 1}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, cantidad: Number.parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>&nbsp;</Label>
                <Button type="button" onClick={handleAddItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>

            {formData.items.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3">Descripción</th>
                      <th className="text-right p-3">Costo</th>
                      <th className="text-center p-3">Cant.</th>
                      <th className="text-right p-3">Subtotal</th>
                      <th className="text-center p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3">{item.descripcion}</td>
                        <td className="text-right p-3">${item.costo.toLocaleString("es-CL")}</td>
                        <td className="text-center p-3">{item.cantidad}</td>
                        <td className="text-right p-3 font-medium">${item.subtotal.toLocaleString("es-CL")}</td>
                        <td className="text-center p-3">
                          <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveItem(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted font-bold">
                      <td colSpan={3} className="text-right p-3">
                        Total:
                      </td>
                      <td className="text-right p-3">${calculateTotal().toLocaleString("es-CL")}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay items agregados. Agregue servicios o repuestos para continuar.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear Mantención y Generar OT"}
          </Button>
        </div>
      </form>
    </div>
  )
}
