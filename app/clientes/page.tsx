import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { ProtectedRoute } from "@/components/auth/protected-route";
import CustomersTable from "@/components/customers/customers-table";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clientes - ERP Rentacar",
  description: "Gestión de clientes del sistema",
}

export default function CustomersPage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["read"]}>
        <div className="container mx-auto py-6">
          <CustomersTable />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}