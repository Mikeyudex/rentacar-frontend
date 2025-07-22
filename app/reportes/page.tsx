import type { Metadata } from "next"

import { ProductCreationReport } from "@/components/reports/product-creation-report"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthWrapper } from "@/components/auth/auth-wrapper"

export const metadata: Metadata = {
  title: "Reportes - Sistema ERP",
  description: "Reportes y análisis del sistema",
}

export default function ReportesPage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["read"]}role="admin">
        <div className="flex-1 space-y-4 p-4 md:p-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">Análisis y reportes de actividad del sistema</p>
          </div>
          <ProductCreationReport />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}
