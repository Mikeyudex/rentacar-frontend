import type {
  ReportResponse,
  ReportFilters,
  ProductCreationReport,
  ReportUser,
  ReportSummary,
} from "@/lib/report-types"

// URL base de la API (en producción, esto vendría de variables de entorno)
const API_URL = process.env.NEXT_PUBLIC_ENV === "LOCAL" ? process.env.NEXT_PUBLIC_API_URL_LOCAL : process.env.NEXT_PUBLIC_API_URL
const username = process.env.NEXT_PUBLIC_USERNAME || "admin@example.com";
const password = process.env.NEXT_PUBLIC_PASSWORD || "";

/**
 * Obtiene los usuarios disponibles para el filtro
 */
export async function getReportUsers(): Promise<ReportUser[]> {
  try {
    const response = await fetch(`${API_URL}/users/`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    let data = await response.json();
    let mapUsers: ReportUser[] = data?.map((user: any) => ({
      id: user?._id,
      name: `${user?.nombre} ${user?.apellido}`,
      email: user?.email,
      role: user?.rol || "operativo",
    })) || [];
    return mapUsers;
  } catch (error) {
    console.error("Error al obtener usuarios para reportes:", error)
    throw error
  }
}

/**
 * Obtiene el reporte de creación de productos
 */
export async function getProductCreationReport(filters: ReportFilters): Promise<ReportResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: filters.page.toString(),
      limit: filters.limit.toString(),
      ...(filters.userId && { user_id: filters.userId }),
      ...(filters.startDate && { start_date: filters.startDate }),
      ...(filters.endDate && { end_date: filters.endDate }),
    })

    const response = await fetch(`${API_URL}/reports/products?${queryParams}`)

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Error ${response.status}: ${error}`)
    }

    const data = await response.json()
    return data as ReportResponse
  } catch (error) {
    console.error("Error al obtener el reporte de creación de productos:", error)
    throw error
  }
}

/**
 * Exporta el reporte completo a CSV
 */
export async function exportProductCreationReportCSV(data: ProductCreationReport[]): Promise<string> {
  try {
    //generar csv con el data
    const headers = ["Fecha", "Usuario", "Email", "Productos Creados", "Lista de Productos (SKUs)"]
    const csvRows = [headers.join(",")]
    data.forEach((report) => {
      const productSkus = report.productsList.map((p) => p.sku).join("; ");
      const row = [report.date, `"${report.userName}"`, report.userEmail, report.productsCreated.toString(), `"${productSkus}"`];
      csvRows.push(row.join(","));
    });
    return csvRows.join("\n");
  } catch (error) {
    console.error("Error al exportar reporte a CSV:", error)
    throw error
  }
}
