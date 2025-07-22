import type { LoginCredentials, AuthResponse, User, RegisterData, RegisterResponse } from "@/lib/auth-types"
import { indexedDBManager } from "@/lib/indexeddb"
import { getPermissions } from "@/lib/utils";
const API_URL = process.env.NEXT_PUBLIC_ENV === "LOCAL" ? process.env.NEXT_PUBLIC_API_URL_LOCAL : process.env.NEXT_PUBLIC_API_URL


export async function getToken(username: string, password: string): Promise<string> {
  try {
    const formData = new URLSearchParams();
    formData.append("username", username ?? "");
    formData.append("password", password ?? "");
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    if (!response.ok) throw new Error('Error al iniciar sesión');
    let data = await response.json();
    return data?.access_token || null;
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    throw error
  }

}

/**
 * Inicia sesión con email y contraseña
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) throw new Error('Error al iniciar sesión');
    let data = await response.json();
    const user = data?.user || null;

    if (!user) {
      throw new Error("Credenciales inválidas")
    }
    let userMap: User = {
      id: user._id,
      email: user?.email,
      nombre: user?.nombre,
      apellido: user?.apellido,
      role: user?.rol,
      avatar: user?.avatar,
      permissions: getPermissions(user),
    }
    const token = data?.access_token || null;
    const refreshToken = `mock_refresh_token_${user._id}_${Date.now()}`
    const expiresIn = 24 * 60 * 60 * 1000 // 24 horas

    const authResponse: AuthResponse = {
      user: userMap,
      token,
      refreshToken,
      expiresIn,
    }

    // Guardar en IndexedDB
    await indexedDBManager.setAuthData({
      user: userMap,
      token,
      refreshToken,
      expiresAt: Date.now() + expiresIn,
    })

    return authResponse
  } catch (error) {
    console.error("Error en login:", error)
    throw error
  }
}

export async function register(userData: RegisterData): Promise<RegisterResponse> {
  try {
    // En un entorno real, haríamos una solicitud POST a la API
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al registrar usuario');
    let newUser = await response.json();
    return {
      success: true,
      message: "Usuario registrado exitosamente",
      user: newUser,
    }
  } catch (error) {
    console.error("Error en registro:", error)
    throw error
  }
}

/**
 * Cierra la sesión del usuario
 */
export async function logout(): Promise<void> {
  try {
    // En un entorno real, haríamos una solicitud POST a la API
    // const token = await getStoredToken();
    // const response = await fetch(`${API_URL}/auth/logout`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // });
    // if (!response.ok) throw new Error('Error al cerrar sesión');

    // Simulamos una respuesta exitosa
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Limpiar datos locales
    await indexedDBManager.clearAuthData()
  } catch (error) {
    console.error("Error en logout:", error)
    // Limpiar datos locales incluso si hay error en el servidor
    await indexedDBManager.clearAuthData()
    throw error
  }
}

/**
 * Obtiene el usuario actual desde el almacenamiento local
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const authData = await indexedDBManager.getAuthData()
    return authData?.user || null
  } catch (error) {
    console.error("Error al obtener usuario actual:", error)
    return null
  }
}

/**
 * Verifica si el token es válido
 */
export async function isTokenValid(): Promise<boolean> {
  try {
    const isValid = await indexedDBManager.isTokenValid()

    if (!isValid) {
      console.warn("Token inválido o expirado detectado en isTokenValid()")
    }

    return isValid
  } catch (error) {
    console.error("Error al verificar token:", error)
    return false
  }
}

/**
 * Obtiene el token almacenado
 */
export async function getStoredToken(): Promise<string | null> {
  try {
    const authData = await indexedDBManager.getAuthData()
    return authData?.token || null
  } catch (error) {
    console.error("Error al obtener token:", error)
    return null
  }
}

/**
 * Refresca el token de acceso
 */
export async function refreshToken(): Promise<AuthResponse> {
  try {
    const authData = await indexedDBManager.getAuthData()
    if (!authData?.refreshToken) {
      throw new Error("No hay refresh token disponible")
    }

    // En un entorno real, haríamos una solicitud POST a la API
    // const response = await fetch(`${API_URL}/auth/refresh`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ refreshToken: authData.refreshToken }),
    // });
    // if (!response.ok) throw new Error('Error al refrescar token');
    // return await response.json();

    // Simulamos una respuesta exitosa
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newToken = `refreshed_token_${authData.user.id}_${Date.now()}`
    const newRefreshToken = `refreshed_refresh_token_${authData.user.id}_${Date.now()}`
    const expiresIn = 24 * 60 * 60 * 1000 // 24 horas

    const refreshedAuth: AuthResponse = {
      user: authData.user,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn,
    }

    // Actualizar en IndexedDB
    await indexedDBManager.setAuthData({
      user: authData.user,
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: Date.now() + expiresIn,
    })

    return refreshedAuth
  } catch (error) {
    console.error("Error al refrescar token:", error)
    throw error
  }
}

/**
 * Verifica si el usuario tiene un permiso específico
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    return user?.permissions.includes(permission) || false
  } catch (error) {
    console.error("Error al verificar permisos:", error)
    return false
  }
}
