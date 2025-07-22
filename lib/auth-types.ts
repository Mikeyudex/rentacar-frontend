// Tipos para autenticación
export interface User {
  id: string
  email: string
  nombre: string
  apellido: string
  role: string
  avatar?: string
  permissions: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  documento: string
  password: string
  nombre: string
  apellido: string
  rol: "admin" | "operativo"
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface RegisterResponse {
  success: boolean
  message: string
  user?: Omit<User, "permissions | avatar">
}
