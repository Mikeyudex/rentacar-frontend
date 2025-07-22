"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, Loader2, Settings, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ComboboxForm } from "@/components/combobox-form"
import { useToast } from "@/hooks/use-toast"

import { API_URL, createProduct, getNextSku, removeBackgroundImage, uploadImage } from "@/services/product-service";
import { CategoryTreeSelector } from "@/components/category-tree-selector"
import type { Category, CreateProductWoocommerce, WooImages } from "@/lib/types";
import { createSlug, createTag, dataUrlToFile, homologateCategory } from "@/lib/utils"
import { useCategories } from "@/hooks/useCategories"
import { IMAGE_PRESETS } from "@/lib/image-utils"
import type { ImageProcessingOptions } from "@/lib/image-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { indexedDBManager } from "@/lib/indexeddb"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { useLoading } from "@/hooks/use-loading"
import ImagePickerModal from "./ImagePickerModal"
import { DroppedFile } from "@/lib/types"

export function ProductForm() {
  const router = useRouter()
  const { toast } = useToast()

  // Hook de loading personalizado
  const loading = useLoading({
    defaultTitle: "Procesando...",
    autoHide: true,
    autoHideDelay: 2000,
  })

  // Estados del formulario
  const [images, setImages] = useState<WooImages[]>([])
  const [vehiculo, setVehiculo] = useState("")
  const [nombreVehiculo, setNombreVehiculo] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])
  const { availableCategories, isLoadingCategories, modelCategories } = useCategories();
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("");
  const [productUbicacion, setProductUbicacion] = useState("");
  const [productNumeroParte, setProductNumeroParte] = useState("");
  const [productSku, setProductSku] = useState<number>(0);

  // Estados para configuración de imágenes
  const [imagePreset, setImagePreset] = useState<keyof typeof IMAGE_PRESETS>("woocommerce")
  const [showImageSettings, setShowImageSettings] = useState(false)
  const [customImageOptions, setCustomImageOptions] = useState<Partial<ImageProcessingOptions>>({})
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [droppedFiles, setDroppedFiles] = useState<DroppedFile[]>([])
  const [enableWhiteBackground, setEnableWhiteBackground] = useState(true);

  // Estados para controlar las secciones colapsables
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true)
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(true)
  const [isImagesOpen, setIsImagesOpen] = useState(true);

  useEffect(() => {
    (async () => {
      const nextSku = await getNextSku();
      setProductSku(nextSku);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      let authData = await indexedDBManager.getAuthData();
      let userId = authData?.user.id;
      let brand = nombreVehiculo.length > 0 ? nombreVehiculo.split(" ")[0] : nombreVehiculo;
      const productData: CreateProductWoocommerce = {
        sku: productSku.toString(),
        name: `${productName.toUpperCase()} ${nombreVehiculo}`,
        slug: createSlug(`${productName} ${nombreVehiculo}`),
        description: `NÚMERO DE PARTE:  ${productNumeroParte as string}`,
        categories: homologateCategory(selectedCategories, vehiculo),
        regular_price: productPrice,
        stock_quantity: Number.parseInt(productStock),
        tags: [createTag(productUbicacion)],
        images: images,
        manage_stock: true,
        meta_data: [
          {
            key: "_created_by_user_id",
            value: userId
          },
          {
            key: "_wm_attribute",
            value: `BRAND||value_name::${brand},PART_NUMBER||value_name::${productNumeroParte}`
          }
        ],
        user_id: userId,
      }

      // Validaciones básicas
      if (!productData.name || !vehiculo || selectedCategories.length === 0) {
        loading.showError("Error de validación", "Por favor complete todos los campos obligatorios antes de continuar")
        return
      }

      // Mostrar loading con progreso simulado
      loading.showLoading({
        title: "Creando producto...",
        description: "Guardando la información del producto en el sistema",
        progress: 0,
      })

      // Simular progreso
      const progressSteps = [
        { progress: 20, description: "Validando información del producto..." },
        { progress: 40, description: "Procesando imágenes..." },
        { progress: 60, description: "Guardando en la base de datos..." },
        { progress: 80, description: "Configurando categorías..." },
        { progress: 100, description: "Finalizando creación..." },
      ]

      for (const step of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        loading.updateProgress(step.progress)
        loading.showLoading({
          title: "Creando producto...",
          description: step.description,
          progress: step.progress,
        })
      }

      await createProduct(productData)

      loading.showSuccess(
        "¡Producto creado exitosamente!",
        `El producto "${productData.name}" ha sido creado con ${images.length} imágenes optimizadas`,
      )

      // Esperar un momento antes de redirigir
      setTimeout(() => {
        router.push("/productos")
      }, 2000)
    } catch (error: any) {
      console.log(error);
      loading.showError(
        "Error al crear producto",
        "Ocurrió un problema al guardar el producto. Error: " + (error as Error).message
      )
      toast({
        title: "Error",
        description: "No se pudo crear el producto. Error: " + (error as Error).message,
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = async (newImage: string) => {
    if (images.length >= 4) return;
    setIsUploading(true)
    const file = dataUrlToFile(newImage, `imagen-${Date.now()}.jpg`);
    if (!enableWhiteBackground) {
      try {
        const uploaded = await uploadImage(file); // llamada al servicio que sube la imagen
        setImages((prev) => [...prev, { id: uploaded?.id, src: uploaded?.url }]);
      } catch (error) {
        toast({
          title: "Error subiendo imagen",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      try {
        await handleUploadImageByRemoveBackground(file);
      } catch (error) {
        toast({
          title: "Error al remover el fondo",
          description: (error as Error).message,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  }

  const handleUploadImageByRemoveBackground = async (file: File) => {
    try {
      const result = await removeBackgroundImage(file);
      let url_remove_background = `${API_URL}${result?.url}`;
      const imageBlob = await fetch(url_remove_background).then(res => res.blob());
      const processedFile = new File([imageBlob], file.name, { type: imageBlob.type });
      const uploaded = await uploadImage(processedFile);
      setImages((prev) => [...prev, { id: uploaded?.id, src: url_remove_background }]);
    } catch (error) {
      throw new Error(`Error al procesar el fondo de la imagen: ${(error as Error).message}`);
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
  }

  const handleChangeVehiculo = (value: string) => {
    setVehiculo(value)
    let vehiculo = modelCategories.find(category => String(category.id) === value)?.name
    setNombreVehiculo(vehiculo!)
  }

  const currentPreset = IMAGE_PRESETS[imagePreset]

  return (
    <>
      <LoadingOverlay
        isVisible={loading.isLoading}
        title={loading.title}
        description={loading.description}
        progress={loading.progress}
        showProgress={typeof loading.progress === "number"}
        variant={loading.variant}
        size="lg"
      />
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Información Básica */}
          <Collapsible open={isBasicInfoOpen} onOpenChange={setIsBasicInfoOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span>Información Básica</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isBasicInfoOpen ? "rotate-180" : ""}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="vehiculo">Búsqueda por modelo *</Label>
                      <ComboboxForm
                        id="vehiculo"
                        options={modelCategories.map(category => ({ label: category.name, value: category.id.toString() }))}
                        value={vehiculo}
                        onChange={(val) => handleChangeVehiculo(val)}
                        placeholder="Seleccione un vehículo"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" value={productSku} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="nombre">Nombre Producto *</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        placeholder="Ingrese el nombre del producto"
                        required
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="categorias">Categoría por parte *</Label>
                      {isLoadingCategories ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">Cargando categorías...</span>
                        </div>
                      ) : (
                        <CategoryTreeSelector
                          categories={availableCategories}
                          selectedCategories={selectedCategories}
                          onSelectionChange={setSelectedCategories}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Sección 2: Detalles del Producto */}
          <Collapsible open={isProductDetailsOpen} onOpenChange={setIsProductDetailsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span>Detalles del Producto</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isProductDetailsOpen ? "rotate-180" : ""}`}
                    />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ubicacion">Ubicación</Label>
                      <Input
                        id="ubicacion"
                        name="ubicacion"
                        placeholder="Ingrese la ubicación"
                        value={productUbicacion}
                        onChange={(e) => setProductUbicacion(e.target.value)}
                        required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroParte">Número de Parte</Label>
                      <Input
                        id="numeroParte"
                        name="numeroParte"
                        placeholder="Ingrese el número de parte"
                        value={productNumeroParte}
                        onChange={(e) => setProductNumeroParte(e.target.value)}
                        required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="precio">Precio</Label>
                      <Input
                        id="precio"
                        name="precio"
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        required />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        placeholder="0"
                        min="0"
                        step="1"
                        value={productStock}
                        onChange={(e) => setProductStock(e.target.value)}
                        required />
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Sección 3: Imágenes */}
          <Collapsible open={isImagesOpen} onOpenChange={setIsImagesOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span>Imágenes del Producto</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {currentPreset.width}x{currentPreset.height}px
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowImageSettings(!showImageSettings)
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                      <ChevronDown className={`h-4 w-4 transition-transform ${isImagesOpen ? "rotate-180" : ""}`} />
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-4">
                    {/* Configuración de imágenes */}
                    {showImageSettings && (
                      <Card className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Configuración de Optimización</Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowImageSettings(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="imagePreset">Preset de Optimización</Label>
                                <Select
                                  value={imagePreset}
                                  onValueChange={(value) => setImagePreset(value as keyof typeof IMAGE_PRESETS)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="woocommerce">WooCommerce (800x800px) - Recomendado</SelectItem>
                                    <SelectItem value="gallery">Galería (1200x800px) - Alta calidad</SelectItem>
                                    <SelectItem value="thumbnail">Miniatura (300x200px) - Rápida carga</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Información del Preset</Label>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <p>
                                    Dimensiones: {currentPreset.width}x{currentPreset.height}px
                                  </p>
                                  <p>Calidad: {Math.round(currentPreset.quality * 100)}%</p>
                                  <p>Formato: {currentPreset.format.split("/")[1].toUpperCase()}</p>
                                </div>
                              </div>

                              <div className="space-y-2">

                                <div className="text-sm text-muted-foreground space-y-1">
                                  <Label>Activar procesamiento de fondo blanco</Label>
                                  <input className="ml-2 cursor-pointer" type="checkbox" name="enableWhiteBackground" checked={enableWhiteBackground} onChange={(e) => setEnableWhiteBackground(e.target.checked)} />
                                </div>
                                
                              </div>

                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="text-sm text-muted-foreground">
                      Máximo 4 imágenes. Las imágenes se optimizarán automáticamente para mejorar el rendimiento y la
                      experiencia del usuario.
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div
                          key={index}
                          className="relative overflow-hidden cursor-move"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", index.toString())
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault()
                            const draggedIndex = Number(e.dataTransfer.getData("text/plain"))
                            const targetIndex = index
                            if (draggedIndex === targetIndex) return

                            const updated = [...images]
                            const [dragged] = updated.splice(draggedIndex, 1)
                            updated.splice(targetIndex, 0, dragged)
                            setImages(updated)
                          }}
                        >
                          <Card>
                            <CardContent className="p-0">
                              <img
                                src={image.src || "/placeholder.svg"}
                                alt={`Producto ${index + 1}`}
                                className="w-full h-32 object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => handleRemoveImage(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </CardContent>
                          </Card>
                        </div>
                      ))}

                      {images.length < 4 && (
                        <div className="flex flex-col items-center justify-center border border-dashed border-muted rounded-xl h-32 hover:bg-muted/30 cursor-pointer transition-colors">
                          {isUploading && (
                            <div className="flex items-center justify-center col-span-full">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsImagePickerOpen(true)}
                            className="text-sm"
                            disabled={isUploading}
                          >
                            + Agregar Imagen
                          </Button>
                        </div>
                      )}
                    </div>


                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading.isLoading} className="w-full sm:w-auto">
              {loading.isLoading && loading.variant === "default" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Producto"
              )}
            </Button>
          </div>
          <ImagePickerModal
            open={isImagePickerOpen}
            setOpen={setIsImagePickerOpen}
            onImageCapture={handleImageUpload}
            preset={imagePreset}
            customOptions={customImageOptions}
            showCompressionInfo={true}
            droppedFiles={droppedFiles}
            setDroppedFiles={setDroppedFiles}
          />
        </form>
      </div>
    </>
  )
}
