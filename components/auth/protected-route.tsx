"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useAuth } from "@/hooks/use-auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermissions?: string[]
  fallbackPath?: string
  role?: string
}

export function ProtectedRoute({ children, requiredPermissions = [], fallbackPath = "/login", role = "" }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(fallbackPath)
    }
  }, [isAuthenticated, isLoading, router, fallbackPath])

  // Verificar permisos si están especificados
  useEffect(() => {
    if (isAuthenticated && user && requiredPermissions.length > 0) {
      if(!role){
        return;
      }
      //const hasRequiredPermissions = requiredPermissions.every((permission) => user.permissions.includes(permission))
      const hasRequiredPermissions = role === user.role
      if (!hasRequiredPermissions) {
        router.push("/unauthorized")
      }
    }
  }, [isAuthenticated, user, requiredPermissions, router])

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

  if (!isAuthenticated) {
    return null
  }

  // Verificar permisos
  if (requiredPermissions.length > 0 && user) {
    const hasRequiredPermissions = requiredPermissions.every((permission) => user.permissions.includes(permission))

    if (!hasRequiredPermissions) {
      return null
    }
  }

  return <>{children}</>
}
