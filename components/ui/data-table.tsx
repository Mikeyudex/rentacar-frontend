"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2, Search, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import type { DataTableProps, DataTableColumn } from "@/lib/data-table-types"

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = "Buscar...",
  isLoading = false,
  error = null,
  onRetry,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchTerm,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortChange,
  actions,
}: DataTableProps<T>) {
  // Estado para visibilidad de columnas
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(() => {
    const initialVisibility: Record<string, boolean> = {}
    columns.forEach((column) => {
      initialVisibility[column.id] = true
    })
    return initialVisibility
  })

  // Filtrar columnas visibles
  const visibleColumns = columns.filter((column) => columnVisibility[column.id])

  // Función para manejar el ordenamiento
  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable || !onSortChange) return

    const newOrder = sortBy === column.id && sortOrder === "asc" ? "desc" : "asc"
    onSortChange(column.id, newOrder)
  }

  // Función para obtener el valor de una celda
  const getCellValue = (row: T, column: DataTableColumn<T>) => {
    if (column.cell) {
      return column.cell(row)
    }
    if (column.accessorKey) {
      return row[column.accessorKey]
    }
    return ""
  }

  // Calcular el rango de elementos mostrados
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  // Renderizar el contenido principal
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            <p>{error}</p>
            {onRetry && (
              <Button variant="outline" className="mt-4" onClick={onRetry}>
                Reintentar
              </Button>
            )}
          </CardContent>
        </Card>
      )
    }

    return (
      <>
        {/* Vista de tabla para desktop */}
        <div className="hidden md:block">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        column.align === "center" && "text-center",
                        column.align === "right" && "text-right",
                        column.sortable && "cursor-pointer select-none hover:bg-muted/50",
                      )}
                      style={{ width: column.size ? `${column.size}px` : undefined }}
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {column.sortable && (
                          <div className="flex flex-col">
                            <ChevronUp
                              className={cn(
                                "h-3 w-3",
                                sortBy === column.id && sortOrder === "asc"
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            />
                            <ChevronDown
                              className={cn(
                                "h-3 w-3 -mt-1",
                                sortBy === column.id && sortOrder === "desc"
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            />
                          </div>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  {actions && <TableHead className="w-[80px]"></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((row, index) => (
                    <TableRow key={index}>
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.id}
                          className={cn(
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                          )}
                        >
                          {getCellValue(row, column)}
                        </TableCell>
                      ))}
                      {actions && <TableCell>{actions(row)}</TableCell>}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + (actions ? 1 : 0)} className="text-center py-4">
                      <div className="text-muted-foreground">No se encontraron resultados</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Vista de tarjetas para móvil */}
        <div className="md:hidden space-y-4">
          {data.length > 0 ? (
            data.map((row, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {visibleColumns.map((column) => (
                      <div key={column.id} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-muted-foreground">{column.header}:</span>
                        <span className="text-sm text-right flex-1 ml-2">{getCellValue(row, column)}</span>
                      </div>
                    ))}
                    {actions && <div className="pt-2 border-t">{actions(row)}</div>}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">No se encontraron resultados</CardContent>
            </Card>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de columnas visibles */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto hidden sm:flex">
                <Settings2 className="mr-2 h-4 w-4" />
                Columnas
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Columnas visibles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns
                .filter((column) => column.hideable !== false)
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={columnVisibility[column.id]}
                    onCheckedChange={(value) =>
                      setColumnVisibility((prev) => ({
                        ...prev,
                        [column.id]: !!value,
                      }))
                    }
                  >
                    {column.header}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Selector de tamaño de página */}
          <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Mostrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 por página</SelectItem>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="15">15 por página</SelectItem>
              <SelectItem value="20">20 por página</SelectItem>
              <SelectItem value="50">50 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Contenido principal */}
      {renderContent()}

      {/* Paginación */}
      {!isLoading && !error && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {data.length > 0 ? startItem : 0} a {data.length > 0 ? endItem : 0} de {totalItems} resultados
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Página anterior</span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNumber: number

                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else {
                  const middlePoint = Math.min(Math.max(currentPage, 3), totalPages - 2)
                  pageNumber = middlePoint - 2 + i
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(pageNumber)}
                    disabled={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Página siguiente</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
