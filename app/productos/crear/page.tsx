import type { Metadata } from "next"

import { ProductForm } from "@/components/product-form"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthWrapper } from "@/components/auth/auth-wrapper"

export const metadata: Metadata = {
  title: "Crear Producto",
  description: "Formulario para crear un nuevo producto",
}

export default function CrearProductoPage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["read"]}>
        <div className="flex-1 space-y-4 p-4 md:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Crear Nuevo Producto</h1>
            <p className="text-muted-foreground">Complete el formulario para crear un nuevo producto en el sistema</p>
          </div>
          <ProductForm />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}
