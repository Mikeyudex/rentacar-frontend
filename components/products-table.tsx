"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Search, Trash, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge"

import { getProducts } from "@/services/product-service"
import type { Product } from "@/lib/types"
import { numberFormatPrice } from "@/lib/utils"

// Colores para los badges de categorías
const categoryColors = ["default", "secondary", "success", "warning", "info"] as const

const getCategoryColor = (index: number) => {
  return categoryColors[index % categoryColors.length]
}

export function ProductsTable() {
  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Estado para los productos
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Estado para la carga y errores
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Toast para notificaciones
  const { toast } = useToast()

  // Efecto para debounce de la búsqueda
  useEffect(() => {
    const term = searchTerm.toLowerCase()
    let filtered = products;

    // Aplicar filtro general de búsqueda si existe
    if (term) {
      filtered = filtered.filter(
        (product) =>
        (String(product?.id).includes(term) ||
          (product?.nombre && product?.nombre.toLowerCase().includes(term)) ||
          (product?.categorias && product?.categorias.some((categoria) => categoria.name.toLowerCase().includes(term))) ||
          (product?.modelo && product?.modelo.toLowerCase().includes(term)) ||
          (product?.ubicacion && product?.ubicacion.toLowerCase().includes(term)) ||
          (product?.numeroParte && product?.numeroParte.toLowerCase().includes(term)) ||
          (product?.sku && product?.sku.toLowerCase().includes(term)))
      )
    }
    setFilteredProducts(filtered);
  }, [searchTerm])

  // Efecto para cargar los productos
  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await getProducts({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchTerm,
        })
        setProducts(response.data)
        setFilteredProducts(response.data)
        setTotalPages(response.meta.totalPages)
        setTotalItems(response.meta.totalItems)
      } catch (err) {
        setError("Error al cargar los productos. Intente nuevamente.")
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [currentPage, pageSize, debouncedSearchTerm, toast])

  // Función para manejar la eliminación de un producto
/*   const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id)

      // Actualizar la lista de productos
      const updatedProducts = products.filter((product) => product.id !== id)
      setProducts(updatedProducts)

      // Si eliminamos el último producto de la página, ir a la página anterior
      if (updatedProducts.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      } else {
        // Recargar la página actual
        const response = await getProducts({
          page: currentPage,
          limit: pageSize,
          search: debouncedSearchTerm,
        })

        setProducts(response.data)
        setTotalPages(response.meta.totalPages)
        setTotalItems(response.meta.totalItems)
      }

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      })
    }
  } */

  // Calcular el rango de productos mostrados
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar productos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => {
              setPageSize(Number(value))
              setCurrentPage(1) // Resetear a la primera página cuando cambia el tamaño
            }}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Mostrar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 por página</SelectItem>
              <SelectItem value="10">10 por página</SelectItem>
              <SelectItem value="15">15 por página</SelectItem>
              <SelectItem value="20">20 por página</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            <p>{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setCurrentPage(1)
                setError(null)
                setIsLoading(true)
              }}
            >
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Vista de tabla para desktop */}
          <div className="hidden md:block">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categorías</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((producto) => (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.sku}</TableCell>
                        <TableCell>{producto.nombre}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {producto.categorias.map((categoria, index) => (
                              <Badge key={categoria.id}
                                variant={getCategoryColor(index)}>
                                {categoria.name}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{producto.modelo}</TableCell>
                        <TableCell className="text-right">{numberFormatPrice(producto.precio)}</TableCell>
                        <TableCell className="text-right">{producto.stock}</TableCell>
                   {/*      <TableCell> */}
                       {/*    <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                              </Button>
                            </DropdownMenuTrigger>
                           <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteProduct(producto.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent> 
                          </DropdownMenu> */}
                        {/* </TableCell> */}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Vista de tarjetas para móvil */}
          <div className="md:hidden space-y-4">
            {products.length > 0 ? (
              products.map((producto) => (
                <Card key={producto.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="font-medium">{producto.nombre}</div>
                        <div className="text-sm text-muted-foreground">SKU: {producto.sku}</div>
                        <div className="flex flex-wrap gap-1">
                          {producto.categorias.map((categoria, index) => (
                            <Badge key={categoria.id} variant={getCategoryColor(index)} className="text-xs">
                              {categoria.name}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">{producto.modelo}</div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="font-medium">${producto.precio.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">Stock: {producto.stock}</div>
                        </div>
                      </div>
                      {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteProduct(producto.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu> */}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">No se encontraron productos</CardContent>
              </Card>
            )}
          </div>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {products.length > 0 ? startItem : 0} a {products.length > 0 ? endItem : 0} de {totalItems}{" "}
              productos
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Página anterior</span>
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Mostrar máximo 5 páginas
                  let pageNumber: number

                  if (totalPages <= 5) {
                    // Si hay 5 o menos páginas, mostrar todas
                    pageNumber = i + 1
                  } else {
                    // Si hay más de 5 páginas, mostrar un rango centrado en la página actual
                    const middlePoint = Math.min(Math.max(currentPage, 3), totalPages - 2)
                    pageNumber = middlePoint - 2 + i
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setCurrentPage(pageNumber)}
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
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Página siguiente</span>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
