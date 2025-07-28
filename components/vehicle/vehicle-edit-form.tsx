"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, ArrowLeft, Car, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { getVehicleById, updateVehicle } from "@/services/vehicle-service"
import type { Vehicle, UpdateVehicleData } from "@/lib/vehicle-types"

// Schema de validación
const vehicleEditSchema = z.object({
  patente: z
    .string()
    .min(1, "La patente es obligatoria")
    .min(6, "La patente debe tener al menos 6 caracteres")
    .max(10, "La patente no puede tener más de 10 caracteres")
    .regex(/^[A-Z0-9]+$/, "La patente solo puede contener letras y números"),
  marca: z
    .string()
    .min(1, "La marca es obligatoria")
    .min(2, "La marca debe tener al menos 2 caracteres")
    .max(50, "La marca no puede tener más de 50 caracteres"),
  modelo: z
    .string()
    .min(1, "El modelo es obligatorio")
    .min(2, "El modelo debe tener al menos 2 caracteres")
    .max(50, "El modelo no puede tener más de 50 caracteres"),
  numMotor: z
    .string()
    .min(1, "El número de motor es obligatorio")
    .min(5, "El número de motor debe tener al menos 5 caracteres")
    .max(30, "El número de motor no puede tener más de 30 caracteres"),
  numVin: z
    .string()
    .min(1, "El número VIN es obligatorio")
    .min(17, "El número VIN debe tener exactamente 17 caracteres")
    .max(17, "El número VIN debe tener exactamente 17 caracteres")
    .regex(/^[A-HJ-NPR-Z0-9]+$/, "El número VIN contiene caracteres no válidos"),
  color: z
    .string()
    .min(1, "El color es obligatorio")
    .min(2, "El color debe tener al menos 2 caracteres")
    .max(30, "El color no puede tener más de 30 caracteres"),
})

type VehicleEditFormData = z.infer<typeof vehicleEditSchema>

interface VehicleEditFormProps {
  vehicleId: string
}

export function VehicleEditForm({ vehicleId }: VehicleEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<VehicleEditFormData>({
    resolver: zodResolver(vehicleEditSchema),
    defaultValues: {
      patente: "",
      marca: "",
      modelo: "",
      numMotor: "",
      numVin: "",
      color: "",
    },
  })

  useEffect(() => {
    loadVehicle()
  }, [vehicleId])

  const loadVehicle = async () => {
    try {
      setIsLoading(true)
      const vehicleData = await getVehicleById(vehicleId)

      if (vehicleData) {
        setVehicle(vehicleData)
        // Cargar datos en el formulario
        form.reset({
          patente: vehicleData.patente,
          marca: vehicleData.marca,
          modelo: vehicleData.modelo,
          numMotor: vehicleData.numMotor,
          numVin: vehicleData.numVin,
          color: vehicleData.color,
        })
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
      router.push("/vehiculos")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: VehicleEditFormData) => {
    if (!vehicle) return

    setIsSaving(true)

    try {
      console.log("Actualizando vehículo:", data)

      const updateData: UpdateVehicleData = {
        id: vehicle.id,
        patente: data.patente.toUpperCase(),
        marca: data.marca.trim(),
        modelo: data.modelo.trim(),
        numMotor: data.numMotor.toUpperCase(),
        numVin: data.numVin.toUpperCase(),
        color: data.color.trim(),
      }

      const response = await updateVehicle(updateData)

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: response.message,
          duration: 3000,
        })

        // Redirigir al detalle del vehículo
        router.push(`/vehiculos/${vehicleId}`)
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
          duration: 4000,
        })
      }
    } catch (error) {
      console.error("Error al actualizar vehículo:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al actualizar el vehículo",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    if (vehicle) {
      form.reset({
        patente: vehicle.patente,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        numMotor: vehicle.numMotor,
        numVin: vehicle.numVin,
        color: vehicle.color,
      })
      toast({
        title: "Formulario restaurado",
        description: "Se han restaurado los valores originales",
      })
    }
  }

  const handleCancel = () => {
    const hasChanges = form.formState.isDirty

    if (hasChanges) {
      const confirmed = window.confirm("Tiene cambios sin guardar. ¿Está seguro de que desea salir sin guardar?")
      if (!confirmed) return
    }

    router.push(`/vehiculos/${vehicleId}`)
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
      <div className="mb-6">
        <Button variant="outline" onClick={handleCancel} className="mb-4 bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="flex items-center gap-2 mb-2">
          <Car className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Editar Vehículo</h1>
        </div>
        <p className="text-muted-foreground">
          Modificar la información del vehículo con patente <strong>{vehicle.patente}</strong>
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Información del Vehículo</CardTitle>
          <CardDescription>
            Actualice los datos del vehículo. Los campos marcados con * son obligatorios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patente *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC123"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca *</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota" {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Corolla" {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color *</FormLabel>
                      <FormControl>
                        <Input placeholder="Blanco" {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="numMotor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Motor *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="4A-FE123456"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numVin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número VIN *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="JT2AE94A0X0123456"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        disabled={isSaving}
                        maxLength={17}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSaving || !form.formState.isDirty} className="flex-1">
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Cambios
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving || !form.formState.isDirty}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Restaurar
                </Button>

                <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSaving}>
                  Cancelar
                </Button>
              </div>

              {form.formState.isDirty && (
                <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <strong>Nota:</strong> Tiene cambios sin guardar. Asegúrese de guardar antes de salir.
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
