"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

interface AuthWrapperProps {
  children: React.ReactNode,
  role?: string
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const pathname = usePathname()

  // Rutas que no requieren el layout del dashboard
  const publicRoutes = ["/login", "/unauthorized"]
  const isPublicRoute = publicRoutes.includes(pathname)

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div> 
    )
  }

  // Si es una ruta pública o no está autenticado, mostrar sin layout
  if (isPublicRoute || !isAuthenticated) {
    return <>{children}</>
  }

  // Si está autenticado y no es ruta pública, mostrar con layout del dashboard
  return <DashboardLayout role={user?.role}>{children}</DashboardLayout>
}
