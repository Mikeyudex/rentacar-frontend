export interface UserData {
  id: string
  email: string
  documento: string
  nombre: string
  apellido: string
  rol: "admin" | "operativo"
}

export interface CreateUserData {
  email: string
  documento: string
  password: string
  nombre: string
  apellido: string
  rol: "admin" | "operativo"
}

export interface UpdateUserData {
  id: string
  email?: string
  documento?: string
  nombre?: string
  apellido?: string
  rol?: "admin" | "operativo"
  activo?: boolean
}
