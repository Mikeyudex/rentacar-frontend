"use client"

import { useEffect, useState } from "react"
import { Clock, AlertTriangle } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { tokenValidator } from "@/lib/token-validator"
import { useAuth } from "@/hooks/use-auth"

interface SessionMonitorProps {
  showInDevelopment?: boolean
}

export function SessionMonitor({ showInDevelopment = true }: SessionMonitorProps) {
  const { isAuthenticated, forceLogout } = useAuth()
  const [tokenInfo, setTokenInfo] = useState<{
    isValid: boolean
    expiresAt: number | null
    timeUntilExpiry: number
    minutesUntilExpiry: number
  } | null>(null)

  const [currentTime, setCurrentTime] = useState(Date.now())
  const [shouldRender, setShouldRender] = useState(false)

  // Solo mostrar en desarrollo
  const isDevelopment = process.env.NODE_ENV === "development"

  useEffect(() => {
    if ((!isDevelopment && !showInDevelopment) || !isAuthenticated) {
      setShouldRender(false)
      return
    }

    setShouldRender(true)

    const updateTokenInfo = async () => {
      const info = await tokenValidator.getTokenInfo()
      setTokenInfo(info)
    }

    updateTokenInfo()
    const interval = setInterval(() => {
      updateTokenInfo()
      setCurrentTime(Date.now())
    }, 1000)

    return () => clearInterval(interval)
  }, [isAuthenticated, isDevelopment, showInDevelopment])

  if (!shouldRender) {
    return null
  }

  if (!tokenInfo) {
    return null
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (60 * 1000))
    const seconds = Math.floor((ms % (60 * 1000)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getStatusColor = () => {
    if (!tokenInfo.isValid) return "destructive"
    if (tokenInfo.minutesUntilExpiry <= 2) return "destructive"
    if (tokenInfo.minutesUntilExpiry <= 5) return "warning"
    return "success"
  }

  const getStatusText = () => {
    if (!tokenInfo.isValid) return "Expirado"
    if (tokenInfo.minutesUntilExpiry <= 2) return "Crítico"
    if (tokenInfo.minutesUntilExpiry <= 5) return "Advertencia"
    return "Activo"
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 border-2">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-sm">Monitor de Sesión</span>
            </div>
            <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <span className={tokenInfo.isValid ? "text-green-600" : "text-red-600"}>
                {tokenInfo.isValid ? "Válido" : "Inválido"}
              </span>
            </div>

            {tokenInfo.expiresAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expira:</span>
                <span className="font-mono text-xs">{new Date(tokenInfo.expiresAt).toLocaleTimeString()}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiempo restante:</span>
              <span className={`font-mono ${tokenInfo.minutesUntilExpiry <= 5 ? "text-red-600 font-bold" : ""}`}>
                {tokenInfo.isValid ? formatTime(tokenInfo.timeUntilExpiry) : "00:00"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Hora actual:</span>
              <span className="font-mono text-xs">{new Date(currentTime).toLocaleTimeString()}</span>
            </div>
          </div>

          {tokenInfo.minutesUntilExpiry <= 5 && tokenInfo.isValid && (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-800 dark:text-yellow-200">Sesión próxima a expirar</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => window.location.reload()}>
              Actualizar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 text-xs"
              onClick={() => forceLogout("Logout manual desde monitor")}
            >
              Cerrar Sesión
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">🔧 Monitor de desarrollo</div>
        </div>
      </CardContent>
    </Card>
  )
}
