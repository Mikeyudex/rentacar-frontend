import type { PaginatedResponse, PaginationParams, Category } from "@/lib/types"
import { getToken } from "./auth-service"

// URL base de la API (en producción, esto vendría de variables de entorno)
const API_URL = process.env.NEXT_PUBLIC_ENV === "LOCAL" ? process.env.NEXT_PUBLIC_API_URL_LOCAL  : process.env.NEXT_PUBLIC_API_URL
const username = process.env.NEXT_PUBLIC_USERNAME || "admin@example.com";
const password = process.env.NEXT_PUBLIC_PASSWORD || "";


// Datos de ejemplo para simular respuestas de la API
const mockCategories: Category[] = [
  { id: 1, name: "Motor", slug: "motor", parent: 0 },
  { id: 2, name: "Transmisión", slug: "transmision", parent: 0 },
  { id: 3, name: "Suspensión", slug: "suspension", parent: 0 },
  { id: 4, name: "Frenos", slug: "frenos", parent: 0 },
  { id: 5, name: "Carrocería", slug: "carroceria", parent: 0 },
  { id: 6, name: "Eléctrico", slug: "electrico", parent: 0 },
  { id: 7, name: "Refrigeración", slug: "refrigeracion", parent: 0 },
  { id: 8, name: "Combustible", slug: "combustible", parent: 0 },
]

/**
 * Obtiene un listado paginado de categorías
 */
export async function getCategoriesPaginated(params: PaginationParams): Promise<PaginatedResponse<Category>> {
  try {
    // En un entorno real, haríamos una solicitud fetch a la API
    // const response = await fetch(`${API_URL}/categories?page=${params.page}&limit=${params.limit}&search=${params.search || ''}&sortBy=${params.sortBy || ''}&sortOrder=${params.sortOrder || ''}`);
    // if (!response.ok) throw new Error('Error al obtener categorías');
    // return await response.json();

    // Simulamos una respuesta paginada con los datos de ejemplo
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia de red

    const { page, limit, search, sortBy, sortOrder } = params

    // Filtrar por término de búsqueda si existe
    let filteredCategories = mockCategories
    if (search) {
      const searchLower = search.toLowerCase()
      filteredCategories = mockCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(searchLower) || category.slug.toLowerCase().includes(searchLower),
      )
    }

    // Ordenar si se especifica
    if (sortBy && sortOrder) {
      filteredCategories.sort((a, b) => {
        const aValue = a[sortBy as keyof Category]?.toString() || ""
        const bValue = b[sortBy as keyof Category]?.toString() || ""

        if (sortOrder === "asc") {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      })
    }

    // Calcular paginación
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedData = filteredCategories.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(filteredCategories.length / limit),
        totalItems: filteredCategories.length,
        itemsPerPage: limit,
      },
    }
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    throw error
  }
}

export async function getFlatCategories(): Promise<{ label: string; value: string }[]> {
  let token = await getToken(username, password);
  const res = await fetch(`${API_URL}/api/categories/flat`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error("Error al obtener categorías")
  return res.json()
}

export async function getTreeCategories(): Promise<Category[]> {
  let token = await getToken(username, password);
  const res = await fetch(`${API_URL}/api/categories/tree`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  if (!res.ok) throw new Error("Error al obtener categorías")
  return res.json()
}

/**
 * Obtiene una categoría por su ID
 */
/* export async function getCategoryById(id: string): Promise<Category> {
  try {
    // En un entorno real, haríamos una solicitud fetch a la API
    // const response = await fetch(`${API_URL}/categories/${id}`);
    // if (!response.ok) throw new Error('Error al obtener la categoría');
    // return await response.json();

    // Simulamos una respuesta con los datos de ejemplo
    await new Promise((resolve) => setTimeout(resolve, 300)) // Simular latencia de red

    const category = mockCategories.find((c) => c.id === id)
    if (!category) {
      throw new Error("Categoría no encontrada")
    }

    return category
  } catch (error) {
    console.error(`Error al obtener la categoría con ID ${id}:`, error)
    throw error
  }
} */

/**
 * Crea una nueva categoría
 */
/* export async function createCategory(category: Omit<Category, "id">): Promise<Category> {
  try {
    // En un entorno real, haríamos una solicitud POST a la API
    // const response = await fetch(`${API_URL}/categories`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(category),
    // });
    // if (!response.ok) throw new Error('Error al crear la categoría');
    // return await response.json();

    // Simulamos una respuesta exitosa
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia de red

    const newCategory = {
      id: `new-${Date.now()}`,
      ...category,
    }

    return newCategory
  } catch (error) {
    console.error("Error al crear la categoría:", error)
    throw error
  }
} */

/**
 * Actualiza una categoría existente
 */
/* export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  try {
    // En un entorno real, haríamos una solicitud PUT a la API
    // const response = await fetch(`${API_URL}/categories/${id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(category),
    // });
    // if (!response.ok) throw new Error('Error al actualizar la categoría');
    // return await response.json();

    // Simulamos una respuesta exitosa
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia de red

    const existingCategory = mockCategories.find((c) => c.id === id)
    if (!existingCategory) {
      throw new Error("Categoría no encontrada")
    }

    const updatedCategory = {
      ...existingCategory,
      ...category,
    }

    return updatedCategory
  } catch (error) {
    console.error(`Error al actualizar la categoría con ID ${id}:`, error)
    throw error
  }
}
 */
/**
 * Elimina una categoría
 */
/* export async function deleteCategory(id: string): Promise<void> {
  try {
    // En un entorno real, haríamos una solicitud DELETE a la API
    // const response = await fetch(`${API_URL}/categories/${id}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) throw new Error('Error al eliminar la categoría');

    // Simulamos una respuesta exitosa
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia de red

    const categoryIndex = mockCategories.findIndex((c) => c.id === id)
    if (categoryIndex === -1) {
      throw new Error("Categoría no encontrada")
    }

    // En un entorno real, la categoría se eliminaría en el servidor
    console.log(`Categoría con ID ${id} eliminada correctamente`)
  } catch (error) {
    console.error(`Error al eliminar la categoría con ID ${id}:`, error)
    throw error
  }
}
 */