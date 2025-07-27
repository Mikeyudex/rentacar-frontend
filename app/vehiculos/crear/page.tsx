import type { Metadata } from "next"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { VehicleForm } from "@/components/vehicle/vehicle-form"

export const metadata: Metadata = {
  title: "Crear Vehículo",
  description: "Formulario para crear un nuevo vehículo",
}

export default function CrearVehiculoPage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["read"]}>
        <div className="flex-1 space-y-4 p-4 md:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Crear Nuevo Vehículo</h1>
            <p className="text-muted-foreground">Complete el formulario para crear un nuevo vehículo en el sistema</p>
          </div>
          <VehicleForm />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}
