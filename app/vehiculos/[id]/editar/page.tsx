import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { VehicleEditForm } from "@/components/vehicle/vehicle-edit-form"

interface VehicleEditPageProps {
    params: {
        id: string
    }
}

export default function VehicleEditPage({ params }: VehicleEditPageProps) {
    return (
        <AuthWrapper>
            <ProtectedRoute requiredPermissions={["read"]}>
                <VehicleEditForm vehicleId={params.id} />
            </ProtectedRoute>
        </AuthWrapper>
    )
}