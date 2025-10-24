import { MaintenanceTable } from "@/components/preventive-maintenance/maintenance-table"
import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Metadata } from "next"


export const metadata: Metadata = {
  title: "Mantenciones - ERP Rentacar",
  description: "Gestión de mantenciones del sistema",
}

export default function MaintenancePage() {
    return (
        < AuthWrapper >
            <ProtectedRoute requiredPermissions={["read"]}>
                <div className="container mx-auto py-6">
                    <MaintenanceTable />
                </div>
            </ProtectedRoute>
        </AuthWrapper >
    )
}
