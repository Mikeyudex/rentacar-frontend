import type { UserData, CreateUserData, UpdateUserData } from "@/lib/user-types"
import { getToken } from "./auth-service";

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_ENV === "LOCAL" ? process.env.NEXT_PUBLIC_API_URL_LOCAL : process.env.NEXT_PUBLIC_API_URL;
const username = process.env.NEXT_PUBLIC_USERNAME || "admin@example.com";
const password = process.env.NEXT_PUBLIC_PASSWORD || "";

/**
 * Obtiene la lista de todos los usuarios
 */
export async function getUsers(): Promise<UserData[]> {
  try {
    const response = await fetch(`${API_URL}/users/`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    let data = await response.json();
    let mapUsers: UserData[] = data?.map((user: any) => ({
      id: user?._id,
      nombre: user?.nombre,
      apellido: user?.apellido,
      email: user?.email,
      rol: user?.rol || "operativo",
      documento: user?.documento
    })) || [];
    return mapUsers;
  } catch (error) {
    console.error("Error al obtener usuarios para reportes:", error)
    throw error
  }
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(userData: CreateUserData): Promise<UserData> {
  try {
    let token = await getToken(username, password);
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Error al crear usuario');
    let userDataResponse = await response.json();


    // Crear nuevo usuario
    const newUser: UserData = {
      id: userDataResponse?._id,
      email: userData.email,
      documento: userData.documento,
      nombre: userData.nombre,
      apellido: userData.apellido,
      rol: userData.rol,
    }
    return newUser
  } catch (error) {
    console.error("Error al crear usuario:", error)
    throw error
  }
}

/**
 * Actualiza un usuario existente
 */
export async function updateUser(userData: UpdateUserData): Promise<UserData> {
  try {
    let token = await getToken(username, password);
    let userPayload = {
      email: userData.email || "",
      documento: userData.documento || "",
      nombre: userData.nombre || "",
      apellido: userData.apellido || "",
      rol: userData.rol || "operativo",
    }
    const response = await fetch(`${API_URL}/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userPayload),
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');

    const updatedUser: UserData = {
      id: userData.id,
      email: userData.email || "",
      documento: userData.documento || "",
      nombre: userData.nombre || "",
      apellido: userData.apellido || "",
      rol: userData.rol || "operativo",
    }
    return updatedUser
  } catch (error) {
    console.error("Error al actualizar usuario:", error)
    throw error
  }
}

/**
 * Elimina un usuario
 */
export async function deleteUser(userId: string): Promise<void> {
  try {
    let token = await getToken(username, password);
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Error al eliminar usuario');
    return;
  } catch (error) {
    console.error("Error al eliminar usuario:", error)
    throw error
  }
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(userId: string): Promise<UserData | null> {
  try {
    let token = await getToken(username, password);
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Error al obtener usuario');
    let userData = await response.json();

    if (!userData) {
      return null
    }
    return {
      id: userData?._id,
      nombre: userData?.nombre,
      apellido: userData?.apellido,
      email: userData?.email,
      rol: userData?.rol,
      documento: userData?.documento
    }
  } catch (error) {
    console.error("Error al obtener usuario:", error)
    throw error
  }
}
