import type { Metadata } from "next"

import { CategoryForm } from "@/components/category-form"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthWrapper } from "@/components/auth/auth-wrapper"

export const metadata: Metadata = {
  title: "Crear Categoría",
  description: "Formulario para crear una nueva categoría",
}

export default function CrearCategoriaPage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["write"]}>
        <div className="flex-1 space-y-4 p-4 md:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Crear Nueva Categoría</h1>
            <p className="text-muted-foreground">Complete el formulario para crear una nueva categoría en el sistema</p>
          </div>
          <CategoryForm />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}
