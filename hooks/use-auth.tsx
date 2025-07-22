"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { AuthState, LoginCredentials, User } from "@/lib/auth-types"
import { login as loginService, logout as logoutService, getCurrentUser, isTokenValid } from "@/services/auth-service"
import { tokenValidator } from "@/lib/token-validator"
import { StorageCleaner } from "@/lib/storage-cleaner"
import { toast } from "@/hooks/use-toast"

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: (showToast?: boolean) => Promise<void>
  forceLogout: (reason?: string) => Promise<void>
  checkAuth: () => Promise<void>
  user: User | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const router = useRouter()
  const pathname = usePathname()

  // Función para logout forzado (cuando expira el token)
  const forceLogout = useCallback(
    async (reason = "Su sesión ha expirado") => {
      try {
        console.log("Ejecutando logout forzado:", reason)

        // Detener validación de token
        tokenValidator.stopTokenValidation()

        // Limpiar completamente todos los datos
        await StorageCleaner.clearAllAuthData()

        // Actualizar estado
        setAuthState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })

        // Mostrar toast de sesión expirada
        toast({
          title: "Sesión Expirada",
          description: reason,
          variant: "destructive",
          duration: 5000,
        })

        // Verificar limpieza (opcional, para debugging)
        const cleanupResults = await StorageCleaner.verifyCleanup()
        console.log("Resultados de limpieza:", cleanupResults)

        // Redirigir al login
        router.push("/login")
      } catch (error) {
        console.error("Error durante logout forzado:", error)

        // Incluso si hay error, limpiar estado y redirigir
        setAuthState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })

        toast({
          title: "Sesión Terminada",
          description: "Su sesión ha sido cerrada por seguridad",
          variant: "destructive",
        })

        router.push("/login")
      }
    },
    [router],
  )

  // Función para logout normal
  const logout = useCallback(
    async (showToast = true) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }))

        // Detener validación de token
        tokenValidator.stopTokenValidation()

        // Intentar logout en el servidor
        try {
          await logoutService()
        } catch (error) {
          console.warn("Error en logout del servidor, continuando con limpieza local:", error)
        }

        // Limpiar completamente todos los datos
        await StorageCleaner.clearAllAuthData()

        setAuthState({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        })

        if (showToast) {
          toast({
            title: "Sesión cerrada",
            description: "Has cerrado sesión correctamente",
          })
        }

        // Redirigir al login
        router.push("/login")
      } catch (error) {
        console.error("Error durante logout:", error)

        // Forzar logout en caso de error
        await forceLogout("Error al cerrar sesión, sesión terminada por seguridad")
      }
    },
    [router, forceLogout],
  )

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      const authResponse = await loginService(credentials)

      setAuthState({
        user: authResponse.user,
        token: authResponse.token,
        refreshToken: authResponse.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      })

      // Iniciar validación automática del token
      tokenValidator.startTokenValidation(
        () => forceLogout("Su sesión ha expirado automáticamente"),
        (minutesLeft) => {
          // Advertencia cuando quedan pocos minutos
          if (minutesLeft <= 5 && minutesLeft > 0) {
            toast({
              title: "Sesión próxima a expirar",
              description: `Su sesión expirará en ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}`,
              duration: 10000,
            })
          }
        },
      )

      // Redirigir al dashboard después del login exitoso
      router.push("/")
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }


  const checkAuth = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }))

      const isValid = await isTokenValid()
      if (isValid) {
        const user = await getCurrentUser()
        if (user) {
          setAuthState((prev) => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }))
          // Iniciar validación automática del token
          tokenValidator.startTokenValidation(
            () => forceLogout("Su sesión ha expirado automáticamente"),
            (minutesLeft) => {
              if (minutesLeft <= 5 && minutesLeft > 0) {
                toast({
                  title: "Sesión próxima a expirar",
                  description: `Su sesión expirará en ${minutesLeft} minuto${minutesLeft > 1 ? "s" : ""}`,
                  duration: 10000,
                })
              }
            },
          )
          return
        }
      }

      // Si no hay token válido o usuario, ejecutar logout forzado
      await forceLogout("Token inválido o expirado")
    } catch (error) {
      console.error("Error al verificar autenticación:", error)
      await forceLogout("Error de autenticación")
    }
  }

  useEffect(() => {
    checkAuth()
    // Limpiar validación al desmontar
    return () => {
      tokenValidator.stopTokenValidation()
    }
  }, [])

    // Validar token cuando cambia la ruta (opcional)
  useEffect(() => {
    const publicRoutes = ["/login", "/unauthorized"]
    if (!publicRoutes.includes(pathname) && authState.isAuthenticated) {
      // Validación adicional en cambio de ruta
      tokenValidator.validateToken().then((isValid) => {
        if (!isValid) {
          forceLogout("Token expirado detectado durante navegación")
        }
      })
    }
  }, [pathname, authState.isAuthenticated, forceLogout])

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        forceLogout,
        checkAuth,
        user: authState.user || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
