import type { Metadata } from "next"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { SkuCorrelativeForm } from "@/components/sku/sku-correlative-form"

export const metadata: Metadata = {
  title: "Crear Correlativo de SKU",
  description: "Crear un nuevo correlativo para generar SKUs automáticamente",
}

export default function ReportesPage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["read"]} role="admin">
        <div className="flex-1 space-y-4 p-4 md:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">SKU Manager</h1>
            <p className="text-muted-foreground">Modificar correlativo de SKU</p>
          </div>
          <SkuCorrelativeForm />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}
