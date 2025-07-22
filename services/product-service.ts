import type { Category, CreateProductWoocommerce, PaginatedResponse, PaginationParams, Product } from "@/lib/types"
import { getToken } from "./auth-service";

// URL base de la API (en producción, esto vendría de variables de entorno)
export const API_URL = process.env.NEXT_PUBLIC_ENV === "LOCAL" ? process.env.NEXT_PUBLIC_API_URL_LOCAL : process.env.NEXT_PUBLIC_API_URL
const username = process.env.NEXT_PUBLIC_USERNAME || "admin@example.com";
const password = process.env.NEXT_PUBLIC_PASSWORD || "";

/**
 * Obtiene todas las categorías disponibles
 */
/* export async function getCategories(): Promise<Category[]> {
    try {
        // En un entorno real, haríamos una solicitud fetch a la API
        // const response = await fetch(`${API_URL}/categories`);
        // if (!response.ok) throw new Error('Error al obtener categorías');
        // return await response.json();

        // Simulamos una respuesta con las categorías disponibles
        await new Promise((resolve) => setTimeout(resolve, 200)) // Simular latencia de red

        return availableCategories
    } catch (error) {
        console.error("Error al obtener categorías:", error)
        throw error
    }
} */

/**
 * Obtiene un listado paginado de productos
 */
export async function getProducts(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    try {
        let token = await getToken(username, password);
        const response = await fetch(`${API_URL}/api/products?page=${params.page}&limit=${params.limit}&search=${params.search || ''}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Error al obtener productos');
        let data = await response.json();
        let productsData = data?.products ?? [];
        let paginationData = data?.pagination ?? {};

        let mappedData = productsData.map((product: any) => {
            return {
                id: product.id,
                sku: product.sku,
                nombre: product.name,
                categorias: product?.categories,
                modelo: product.model,
                precio: parseInt(product.price),
                stock: product?.stock_quantity || 0,
                ubicacion: product?.location || "",
                numeroParte: product?.part_number || "",
                imagenes: product?.images || [],
            }
        });

        return {
            data: mappedData,
            meta: {
                currentPage: paginationData?.current_page || 0,
                totalPages: paginationData?.total_pages || 0,
                totalItems: paginationData?.total_items || 0,
                itemsPerPage: paginationData?.per_page || 0,
            },
        }
    } catch (error) {
        console.error("Error al obtener productos:", error)
        throw error
    }
}

/**
 * Obtiene un producto por su ID
 */
/* export async function getProductById(id: string): Promise<Product> {
    try {
        // En un entorno real, haríamos una solicitud fetch a la API
        // const response = await fetch(`${API_URL}/products/${id}`);
        // if (!response.ok) throw new Error('Error al obtener el producto');
        // return await response.json();

        // Simulamos una respuesta con los datos de ejemplo
        await new Promise((resolve) => setTimeout(resolve, 300)) // Simular latencia de red

        const product = mockProducts.find((p) => p.id === id)
        if (!product) {
            throw new Error("Producto no encontrado")
        }

        return product
    } catch (error) {
        console.error(`Error al obtener el producto con ID ${id}:`, error)
        throw error
    }
}
 */
/**
 * Crea un nuevo producto
 */
export async function createProduct(product: CreateProductWoocommerce): Promise<Product> {
    try {
        let token = await getToken(username, password);
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Error al crear el producto');
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al crear el producto:", error)
        throw error
    }
}

export async function getNextSku(): Promise<number> {
    try {
        let token = await getToken(username, password);
        const response = await fetch(`${API_URL}/sku/next`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error('Error al obtener el producto');
        let data = await response.json();
        return data?.next_sku || 0;
    } catch (error) {
        console.log("Error al obtener el sku:", error)
        return 0;
    }
}

export async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        let token = await getToken(username, password);
        const res = await fetch(`${API_URL}/media/upload`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Error al subir la imagen");
        }
        return await res.json();
    } catch (error) {
        console.error("Error subiendo imagen:", error);
        throw error;
    }
}

export async function removeBackgroundImage(file: File): Promise<{ id: string, url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    try {
        let token = await getToken(username, password);
        const res = await fetch(`${API_URL}/media/remove_background`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.detail || "Error al procesar el background");
        }
        const data = await res.json();
        return {
            id: data.id,
            url: data.url
        };
    } catch (error) {
        console.error("Error procesando el background:", error);
        throw error;
    }
}

/**
 * Actualiza un producto existente
 */
/* export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia de red

        const existingProduct = mockProducts.find((p) => p.id === id)
        if (!existingProduct) {
            throw new Error("Producto no encontrado")
        }

        const updatedProduct = {
            ...existingProduct,
            ...product,
        }

        return updatedProduct
    } catch (error) {
        console.error(`Error al actualizar el producto con ID ${id}:`, error)
        throw error
    }
} */

/**
 * Elimina un producto
 */
/* export async function deleteProduct(id: string): Promise<void> {
    try {
        await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia de red

        const productIndex = mockProducts.findIndex((p) => p.id === id)
        if (productIndex === -1) {
            throw new Error("Producto no encontrado")
        }

        // En un entorno real, el producto se eliminaría en el servidor
        console.log(`Producto con ID ${id} eliminado correctamente`)
    } catch (error) {
        console.error(`Error al eliminar el producto con ID ${id}:`, error)
        throw error
    }
}  */
