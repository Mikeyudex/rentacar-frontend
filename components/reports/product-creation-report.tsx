"use client"

import { useState, useEffect } from "react"
import { Calendar, Download, FileText, TrendingUp, Users, Package, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { useLoading } from "@/hooks/use-loading"

import { getProductCreationReport, getReportUsers, exportProductCreationReportCSV } from "@/services/report-service"
import type {
  ProductCreationReport as ProductCreationReportType,
  ReportFilters,
  ReportUser,
  ReportSummary,
} from "@/lib/report-types"

export function ProductCreationReport() {
  const { toast } = useToast()

  // Estados para filtros
  const [filters, setFilters] = useState<ReportFilters>({
    userId: undefined,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Últimos 30 días
    endDate: new Date().toISOString().split("T")[0],
    page: 1,
    limit: 10,
  })

  // Estados para datos
  const [reports, setReports] = useState<ProductCreationReportType[]>([])
  const [summary, setSummary] = useState<ReportSummary | null>(null)
  const [users, setUsers] = useState<ReportUser[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Estados de carga
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Hook de loading para exportación
  const exportLoading = useLoading({
    defaultTitle: "Exportando reporte...",
    autoHide: true,
    autoHideDelay: 2000,
  })

  // Cargar usuarios al montar el componente
  useEffect(() => {
    async function loadUsers() {
      try {
        const usersData = await getReportUsers()
        setUsers(usersData)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios",
          variant: "destructive",
        })
      } finally {
        setIsLoadingUsers(false)
      }
    }

    loadUsers()
  }, [toast])

  // Cargar reporte cuando cambien los filtros
  useEffect(() => {
    async function loadReport() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getProductCreationReport(filters)
        setReports(response.data)
        setSummary(response.summary)
        setTotalPages(response.meta.totalPages)
        setTotalItems(response.meta.totalItems)
      } catch (error) {
        setError("Error al cargar el reporte. Intente nuevamente.")
        toast({
          title: "Error",
          description: "No se pudo cargar el reporte",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadReport()
  }, [filters, toast])

  // Función para actualizar filtros
  const updateFilter = (key: keyof ReportFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value, // Resetear página si no es cambio de página
    }))
  }

  // Función para exportar CSV
  const handleExportCSV = async () => {
    try {
      exportLoading.showLoading({
        title: "Generando archivo CSV...",
        description: "Preparando los datos para la descarga",
        progress: 0,
      })

      // Simular progreso
      const progressSteps = [
        { progress: 25, description: "Obteniendo datos del servidor..." },
        { progress: 50, description: "Procesando información..." },
        { progress: 75, description: "Generando archivo CSV..." },
        { progress: 100, description: "Preparando descarga..." },
      ]

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        exportLoading.updateProgress(step.progress)
        exportLoading.showLoading({
          title: "Generando archivo CSV...",
          description: step.description,
          progress: step.progress,
        })
      }

      const csvContent = await exportProductCreationReportCSV(reports)

      // Crear y descargar archivo
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `reporte-productos-${filters.startDate}-${filters.endDate}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      exportLoading.showSuccess("¡Archivo descargado!", "El reporte CSV se ha descargado correctamente")
    } catch (error) {
      exportLoading.showError("Error en la descarga", "No se pudo generar el archivo CSV. Intente nuevamente.")

      toast({
        title: "Error",
        description: "No se pudo exportar el reporte",
        variant: "destructive",
      })
    }
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      userId: undefined,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      page: 1,
      limit: 10,
    })
  }

  return (
    <>
      <LoadingOverlay
        isVisible={exportLoading.isLoading}
        title={exportLoading.title}
        description={exportLoading.description}
        progress={exportLoading.progress}
        showProgress={typeof exportLoading.progress === "number"}
        variant={exportLoading.variant}
        size="md"
      />

      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Filtros de Reporte
            </CardTitle>
            <CardDescription>Configure los parámetros para generar el reporte de creación de productos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="user-filter">Usuario</Label>
                {isLoadingUsers ? (
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">Cargando...</span>
                  </div>
                ) : (
                  <Select
                    value={filters.userId || "all"}
                    onValueChange={(value) => updateFilter("userId", value === "all" ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los usuarios</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Fecha Inicio</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={filters.startDate || ""}
                  onChange={(e) => updateFilter("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Fecha Fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={filters.endDate || ""}
                  onChange={(e) => updateFilter("endDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-size">Elementos por página</Label>
                <Select
                  value={filters.limit.toString()}
                  onValueChange={(value) => updateFilter("limit", Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 por página</SelectItem>
                    <SelectItem value="10">10 por página</SelectItem>
                    <SelectItem value="20">20 por página</SelectItem>
                    <SelectItem value="50">50 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button onClick={clearFilters} variant="outline" className="w-full sm:w-auto">
                Limpiar Filtros
              </Button>
              <Button
                onClick={handleExportCSV}
                className="w-full sm:w-auto"
                disabled={isLoading || exportLoading.isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumen */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalProducts}</div>
                <p className="text-xs text-muted-foreground">En el período seleccionado</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Usuarios que crearon productos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio Diario</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.averageProductsPerDay}</div>
                <p className="text-xs text-muted-foreground">Productos por día</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuario Más Activo</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold truncate">{summary.mostActiveUser.name}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.mostActiveUser.totalProducts} productos creados
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabla de Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Creación de Productos</CardTitle>
            <CardDescription>Detalle de productos creados por usuario y fecha</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-center space-y-4">
                  <LoadingSpinner size="lg" variant="primary" />
                  <div>
                    <p className="font-medium">Generando reporte...</p>
                    <p className="text-sm text-muted-foreground">Procesando datos del período seleccionado</p>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilters({ ...filters })}>
                  Reintentar
                </Button>
              </div>
            ) : (
              <>
                {/* Vista de tabla para desktop */}
                <div className="hidden md:block">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-center">Productos Creados</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.length > 0 ? (
                          reports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  {new Date(report.date + "T12:00:00").toLocaleDateString("es-ES", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </div>
                              </TableCell>
                              <TableCell>{report.userName}</TableCell>
                              <TableCell className="text-muted-foreground">{report.userEmail}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="secondary" className="font-mono">
                                  {report.productsCreated}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Ver detalles</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-80">
                                    <DropdownMenuLabel>Productos Creados</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="max-h-60 overflow-y-auto">
                                      {report.productsList.map((product, index) => (
                                        <DropdownMenuItem key={product.id} className="flex-col items-start">
                                          <div className="font-medium">{product.name}</div>
                                          <div className="text-xs text-muted-foreground">
                                            SKU: {product.sku} •{" "}
                                            {new Date(product.createdAt).toLocaleTimeString("es-ES", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </div>
                                        </DropdownMenuItem>
                                      ))}
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No se encontraron datos para el período seleccionado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Vista de tarjetas para móvil */}
                <div className="md:hidden space-y-4">
                  {reports.length > 0 ? (
                    reports.map((report) => (
                      <Card key={report.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{new Date(report.date + "T12:00:00").toLocaleDateString("es-ES", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}</span>
                              </div>
                              <Badge variant="secondary" className="font-mono">
                                {report.productsCreated} productos
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <div className="font-medium">{report.userName}</div>
                              <div className="text-sm text-muted-foreground">{report.userEmail}</div>
                            </div>

                            <div className="pt-2 border-t">
                              <p className="text-sm font-medium mb-2">Productos creados:</p>
                              <div className="space-y-1 max-h-32 overflow-y-auto">
                                {report.productsList.map((product) => (
                                  <div key={product.id} className="text-xs bg-muted p-2 rounded">
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-muted-foreground">
                                      {product.sku} •{" "}
                                      {new Date(product.createdAt).toLocaleTimeString("es-ES", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center text-muted-foreground">
                        No se encontraron datos para el período seleccionado
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {reports.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0} a{" "}
                      {Math.min(filters.page * filters.limit, totalItems)} de {totalItems} registros
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateFilter("page", filters.page - 1)}
                        disabled={filters.page === 1 || isLoading}
                      >
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNumber: number
                          if (totalPages <= 5) {
                            pageNumber = i + 1
                          } else {
                            const middlePoint = Math.min(Math.max(filters.page, 3), totalPages - 2)
                            pageNumber = middlePoint - 2 + i
                          }

                          return (
                            <Button
                              key={pageNumber}
                              variant={filters.page === pageNumber ? "default" : "outline"}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateFilter("page", pageNumber)}
                              disabled={isLoading}
                            >
                              {pageNumber}
                            </Button>
                          )
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateFilter("page", filters.page + 1)}
                        disabled={filters.page === totalPages || isLoading}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
