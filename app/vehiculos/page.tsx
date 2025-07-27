import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { VehiclesTable } from "@/components/vehicle/vehicles-table";


export default function VehiculosPage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["read"]}>
        <div className="container mx-auto py-6">
          <VehiclesTable />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}