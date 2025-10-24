import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { ProtectedRoute } from "@/components/auth/protected-route";
import CustomerForm from "@/components/customers/customer-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Crear Cliente - ERP Rentacar",
    description: "Crear nuevo cliente en el sistema",
}

export default function CustomersPage() {
    return (
        <AuthWrapper>
            <ProtectedRoute requiredPermissions={["read"]}>
                <div className="container mx-auto py-6">
                    <CustomerForm />
                </div>
            </ProtectedRoute>
        </AuthWrapper>
    )
}