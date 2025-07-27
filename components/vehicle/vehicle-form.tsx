"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Save, ArrowLeft, Car } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { createVehicle } from "@/services/vehicle-service"
import type { CreateVehicleData } from "@/lib/vehicle-types"

// Schema de validación
const vehicleSchema = z.object({
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

type VehicleFormData = z.infer<typeof vehicleSchema>

export function VehicleForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      patente: "",
      marca: "",
      modelo: "",
      numMotor: "",
      numVin: "",
      color: "",
    },
  })

  const onSubmit = async (data: VehicleFormData) => {
    setIsLoading(true)

    try {
      console.log("Enviando datos del vehículo:", data)

      const vehicleData: CreateVehicleData = {
        patente: data.patente.toUpperCase(),
        marca: data.marca.trim(),
        modelo: data.modelo.trim(),
        numMotor: data.numMotor.toUpperCase(),
        numVin: data.numVin.toUpperCase(),
        color: data.color.trim(),
      }

      const response = await createVehicle(vehicleData)

      if (response.success) {
        toast({
          title: "¡Éxito!",
          description: response.message,
          duration: 3000,
        })

        // Resetear formulario
        form.reset()

        // Redirigir a la lista de vehículos
        router.push("/vehiculos")
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
          duration: 4000,
        })
      }
    } catch (error) {
      console.error("Error al crear vehículo:", error)
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al crear el vehículo",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

        <Card className="space-y-4 max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Información del Vehículo</CardTitle>
            <CardDescription>Ingrese todos los datos requeridos para registrar el vehículo</CardDescription>
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
                            disabled={isLoading}
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
                          <Input placeholder="Toyota" {...field} disabled={isLoading} />
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
                          <Input placeholder="Corolla" {...field} disabled={isLoading} />
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
                          <Input placeholder="Blanco" {...field} disabled={isLoading} />
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
                          disabled={isLoading}
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
                          disabled={isLoading}
                          maxLength={17}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Crear Vehículo
                      </>
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isLoading}>
                    Limpiar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

    </div>
  )
}
