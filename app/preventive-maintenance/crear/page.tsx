import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { MaintenanceForm } from "@/components/preventive-maintenance/maintenance-form"

export default function CreateMaintenancePage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["read"]}>
        <div className="container mx-auto py-6">
          <MaintenanceForm />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}
