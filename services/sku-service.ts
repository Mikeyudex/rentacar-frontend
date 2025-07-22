import { getToken } from "./auth-service";

// URL base de la API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"
const username = process.env.NEXT_PUBLIC_USERNAME || "admin@example.com";
const password = process.env.NEXT_PUBLIC_PASSWORD || "";


export async function updateSequenceSku(correlative: string) {
  try {
    let token = await getToken(username, password);
    const response = await fetch(`${API_URL}/sku/update-sequence/${Number(correlative)}`, {
      method: 'PUT',
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });
    if (!response.ok) throw new Error('Error al actualizar el correlativo. Error: ' + response.statusText);
    return {
      success: true,
      message: "Correlativo actualizado exitosamente",
    }
  } catch (error) {
    console.log("Error al obtener el sku:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error al actualizar el correlativo",
    }
  }

}