import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { ProtectedRoute } from "@/components/auth/protected-route";
import CustomerDetail from "@/components/customers/customer-detail";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Detalle de Cliente - ERP Rentacar",
    description: "Información detallada del cliente",
}

interface CustomerDetailPageProps {
    params: {
        id: string
    }
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
    return (
        <AuthWrapper>
            <ProtectedRoute requiredPermissions={["read"]}>
                <div className="container mx-auto py-6">
                    <CustomerDetail customerId={params.id} />
                </div>
            </ProtectedRoute>
        </AuthWrapper>
    )
}