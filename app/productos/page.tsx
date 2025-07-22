import type { Metadata } from "next"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ProductsTable } from "@/components/products-table"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AuthWrapper } from "@/components/auth/auth-wrapper"

export const metadata: Metadata = {
  title: "Productos",
  description: "Gestión de productos",
}

export default function ProductosPage() {
  return (
    <AuthWrapper>
      <ProtectedRoute requiredPermissions={["read"]}>
        <div className="flex-1 space-y-4 p-4 md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Productos</h1>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/productos/crear">
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Producto
              </Link>
            </Button>
          </div>
          <ProductsTable />
        </div>
      </ProtectedRoute>
    </AuthWrapper>
  )
}
