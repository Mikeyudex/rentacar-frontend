// Utilidades para limpiar completamente el almacenamiento
export class StorageCleaner {
  /**
   * Limpia todos los datos de autenticación del navegador
   */
  static async clearAllAuthData(): Promise<void> {
    const cleanupTasks: Promise<void>[] = []

    // 1. Limpiar IndexedDB
    cleanupTasks.push(this.clearIndexedDB())

    // 2. Limpiar localStorage
    cleanupTasks.push(this.clearLocalStorage())

    // 3. Limpiar sessionStorage
    cleanupTasks.push(this.clearSessionStorage())

    // 4. Limpiar cookies relacionadas con auth
    cleanupTasks.push(this.clearAuthCookies())

    try {
      await Promise.all(cleanupTasks)
      console.log("Todos los datos de autenticación han sido limpiados")
    } catch (error) {
      console.error("Error durante la limpieza de datos:", error)
      // Continuar con la limpieza aunque haya errores
    }
  }

  /**
   * Limpia IndexedDB
   */
  private static async clearIndexedDB(): Promise<void> {
    try {
      const { indexedDBManager } = await import("@/lib/indexeddb")
      await indexedDBManager.clearAuthData()
      console.log("IndexedDB limpiado correctamente")
    } catch (error) {
      console.error("Error limpiando IndexedDB:", error)
    }
  }

  /**
   * Limpia localStorage
   */
  private static async clearLocalStorage(): Promise<void> {
    try {
      // Claves relacionadas con autenticación que podrían existir
      const authKeys = [
        "auth_token",
        "refresh_token",
        "user_data",
        "auth_state",
        "session_data",
        "user_preferences",
        "last_login",
        "remember_me",
      ]

      authKeys.forEach((key) => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          console.log(`localStorage: ${key} removido`)
        }
      })

      // También limpiar cualquier clave que comience con 'auth_' o 'user_'
      const allKeys = Object.keys(localStorage)
      allKeys.forEach((key) => {
        if (key.startsWith("auth_") || key.startsWith("user_") || key.startsWith("session_")) {
          localStorage.removeItem(key)
          console.log(`localStorage: ${key} removido (patrón)`)
        }
      })

      console.log("localStorage limpiado correctamente")
    } catch (error) {
      console.error("Error limpiando localStorage:", error)
    }
  }

  /**
   * Limpia sessionStorage
   */
  private static async clearSessionStorage(): Promise<void> {
    try {
      // Claves relacionadas con autenticación en sessionStorage
      const authKeys = ["temp_token", "session_id", "csrf_token", "temp_user_data"]

      authKeys.forEach((key) => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key)
          console.log(`sessionStorage: ${key} removido`)
        }
      })

      // Limpiar claves con patrones específicos
      const allKeys = Object.keys(sessionStorage)
      allKeys.forEach((key) => {
        if (key.startsWith("auth_") || key.startsWith("temp_") || key.startsWith("session_")) {
          sessionStorage.removeItem(key)
          console.log(`sessionStorage: ${key} removido (patrón)`)
        }
      })

      console.log("sessionStorage limpiado correctamente")
    } catch (error) {
      console.error("Error limpiando sessionStorage:", error)
    }
  }

  /**
   * Limpia cookies relacionadas con autenticación
   */
  private static async clearAuthCookies(): Promise<void> {
    try {
      // Lista de cookies relacionadas con autenticación
      const authCookies = [
        "auth_token",
        "refresh_token",
        "session_id",
        "user_id",
        "remember_token",
        "csrf_token",
        "sidebar:state", // Cookie del sidebar que también limpiamos
        "theme", // Opcional: mantener o limpiar según preferencia
      ]

      authCookies.forEach((cookieName) => {
        // Limpiar cookie en diferentes paths y dominios
        const paths = ["/", "/login", "/dashboard"]
        const domains = [window.location.hostname, `.${window.location.hostname}`]

        paths.forEach((path) => {
          domains.forEach((domain) => {
            // Expirar la cookie estableciendo una fecha pasada
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
          })
        })

        console.log(`Cookie ${cookieName} limpiada`)
      })

      console.log("Cookies de autenticación limpiadas correctamente")
    } catch (error) {
      console.error("Error limpiando cookies:", error)
    }
  }

  /**
   * Verifica si quedan datos de autenticación
   */
  static async verifyCleanup(): Promise<{
    indexedDB: boolean
    localStorage: boolean
    sessionStorage: boolean
    cookies: boolean
  }> {
    const results = {
      indexedDB: false,
      localStorage: false,
      sessionStorage: false,
      cookies: false,
    }

    try {
      // Verificar IndexedDB
      const { indexedDBManager } = await import("@/lib/indexeddb")
      const authData = await indexedDBManager.getAuthData()
      results.indexedDB = authData === null

      // Verificar localStorage
      const localStorageKeys = Object.keys(localStorage)
      const hasLocalAuthData = localStorageKeys.some(
        (key) => key.startsWith("auth_") || key.startsWith("user_") || key.startsWith("session_"),
      )
      results.localStorage = !hasLocalAuthData

      // Verificar sessionStorage
      const sessionStorageKeys = Object.keys(sessionStorage)
      const hasSessionAuthData = sessionStorageKeys.some(
        (key) => key.startsWith("auth_") || key.startsWith("temp_") || key.startsWith("session_"),
      )
      results.sessionStorage = !hasSessionAuthData

      // Verificar cookies (simplificado)
      const hasCookies =
        document.cookie.includes("auth_token") ||
        document.cookie.includes("refresh_token") ||
        document.cookie.includes("session_id")
      results.cookies = !hasCookies

      console.log("Verificación de limpieza:", results)
      return results
    } catch (error) {
      console.error("Error verificando limpieza:", error)
      return results
    }
  }
}
