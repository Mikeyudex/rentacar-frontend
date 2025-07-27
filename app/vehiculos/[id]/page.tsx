import { AuthWrapper } from "@/components/auth/auth-wrapper"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { VehicleDetail } from "@/components/vehicle/vehicle-detail"

interface VehicleDetailPageProps {
    params: {
        id: string
    }
}

export default function VehicleDetailPage({ params }: VehicleDetailPageProps) {
    return (
        <AuthWrapper>
            <ProtectedRoute requiredPermissions={["read"]}>
                <VehicleDetail vehicleId={params.id} />
            </ProtectedRoute>
        </AuthWrapper>
    )
}
