// Utilidades para validación de tokens
export class TokenValidator {
  private static instance: TokenValidator
  private checkInterval: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 60000 // Verificar cada minuto
  private readonly WARNING_THRESHOLD = 5 * 60 * 1000 // Advertir 5 minutos antes

  private constructor() {}

  static getInstance(): TokenValidator {
    if (!TokenValidator.instance) {
      TokenValidator.instance = new TokenValidator()
    }
    return TokenValidator.instance
  }

  /**
   * Inicia la validación periódica del token
   */
  startTokenValidation(onTokenExpired: () => void, onTokenWarning?: (minutesLeft: number) => void): void {
    this.stopTokenValidation() // Limpiar cualquier validación anterior

    this.checkInterval = setInterval(async () => {
      try {
        const isValid = await this.validateCurrentToken()

        if (!isValid) {
          console.warn("Token expirado detectado, ejecutando logout automático")
          onTokenExpired()
          return
        }

        // Verificar si el token está próximo a expirar
        if (onTokenWarning) {
          const timeUntilExpiry = await this.getTimeUntilExpiry()
          if (timeUntilExpiry > 0 && timeUntilExpiry <= this.WARNING_THRESHOLD) {
            const minutesLeft = Math.ceil(timeUntilExpiry / (60 * 1000))
            onTokenWarning(minutesLeft)
          }
        }
      } catch (error) {
        console.error("Error durante validación de token:", error)
        // En caso de error, también ejecutar logout por seguridad
        onTokenExpired()
      }
    }, this.CHECK_INTERVAL)
  }

  /**
   * Detiene la validación periódica del token
   */
  stopTokenValidation(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * Valida el token actual
   */
  private async validateCurrentToken(): Promise<boolean> {
    try {
      const { indexedDBManager } = await import("@/lib/indexeddb")
      const authData = await indexedDBManager.getAuthData()

      if (!authData) {
        return false
      }

      // Verificar si el token ha expirado
      const now = Date.now()
      const isExpired = authData.expiresAt <= now

      if (isExpired) {
        console.warn(`Token expirado: ${new Date(authData.expiresAt).toISOString()} <= ${new Date(now).toISOString()}`)
        return false
      }

      return true
    } catch (error) {
      console.error("Error validando token:", error)
      return false
    }
  }

  /**
   * Obtiene el tiempo restante hasta que expire el token
   */
  private async getTimeUntilExpiry(): Promise<number> {
    try {
      const { indexedDBManager } = await import("@/lib/indexeddb")
      const authData = await indexedDBManager.getAuthData()

      if (!authData) {
        return 0
      }

      const now = Date.now()
      const timeLeft = authData.expiresAt - now

      return Math.max(0, timeLeft)
    } catch (error) {
      console.error("Error obteniendo tiempo de expiración:", error)
      return 0
    }
  }

  /**
   * Valida manualmente el token (para uso en interceptores)
   */
  async validateToken(): Promise<boolean> {
    return this.validateCurrentToken()
  }

  /**
   * Obtiene información del token actual
   */
  async getTokenInfo(): Promise<{
    isValid: boolean
    expiresAt: number | null
    timeUntilExpiry: number
    minutesUntilExpiry: number
  }> {
    try {
      const { indexedDBManager } = await import("@/lib/indexeddb")
      const authData = await indexedDBManager.getAuthData()

      if (!authData) {
        return {
          isValid: false,
          expiresAt: null,
          timeUntilExpiry: 0,
          minutesUntilExpiry: 0,
        }
      }

      const now = Date.now()
      const timeUntilExpiry = Math.max(0, authData.expiresAt - now)
      const minutesUntilExpiry = Math.ceil(timeUntilExpiry / (60 * 1000))
      const isValid = timeUntilExpiry > 0

      return {
        isValid,
        expiresAt: authData.expiresAt,
        timeUntilExpiry,
        minutesUntilExpiry,
      }
    } catch (error) {
      console.error("Error obteniendo información del token:", error)
      return {
        isValid: false,
        expiresAt: null,
        timeUntilExpiry: 0,
        minutesUntilExpiry: 0,
      }
    }
  }
}

// Instancia singleton
export const tokenValidator = TokenValidator.getInstance()
