import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { ProtectedRoute } from "@/components/auth/protected-route";
import CustomerEditForm from "@/components/customers/customer-edit-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Editar Cliente - ERP Rentacar",
    description: "Editar información del cliente",
}

interface EditCustomerPageProps {
  params: {
    id: string
  }
}

export default function EditCustomerPage({ params }: EditCustomerPageProps) {
    return (
        <AuthWrapper>
            <ProtectedRoute requiredPermissions={["read"]}>
                <div className="container mx-auto py-6">
                    <CustomerEditForm customerId={params.id} />
                </div>
            </ProtectedRoute>
        </AuthWrapper>
    )
}