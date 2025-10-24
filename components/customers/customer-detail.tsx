"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Customer } from "@/lib/customer-types"
import { customerService } from "@/services/customer-service";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, MapPin, FileText, Calendar, ExternalLink } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CustomerDetailProps {
  customerId: string
}

export default function CustomerDetail({ customerId }: CustomerDetailProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true)
        const customerData = await customerService.getCustomerById(customerId)
        setCustomer(customerData)
      } catch (error) {
        toast({
          title: "Error al cargar cliente",
          description: error instanceof Error ? error.message : "Cliente no encontrado",
          variant: "destructive",
        })
        router.push("/clientes")
      } finally {
        setLoading(false)
      }
    }

    if (customerId) {
      loadCustomer()
    }
  }, [customerId, router, toast])

  const handleEdit = () => {
    router.push(`/clientes/${customerId}/editar`)
  }

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!customer) return

    setIsDeleting(true)
    try {
      await customerService.deleteCustomer(customer.id)
      toast({
        title: "Cliente eliminado",
        description: `${customer.nombres} ${customer.apellidos} ha sido eliminado correctamente`,
      })
      router.push("/clientes")
    } catch (error) {
      toast({
        title: "Error al eliminar cliente",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Cliente no encontrado</p>
      </div>
    )
  }

  const DocumentPreview = ({ url, label }: { url?: string; label: string }) => {
    if (!url) {
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No disponible</p>
        </div>
      )
    }

    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{label}</span>
          <Button variant="ghost" size="sm" onClick={() => window.open(url, "_blank")} className="h-8 w-8 p-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        <div className="aspect-video bg-white rounded border flex items-center justify-center">
          {url.toLowerCase().includes(".pdf") ? (
            <div className="text-center">
              <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Documento PDF</p>
            </div>
          ) : (
            <img src={url || "/placeholder.svg"} alt={label} className="max-w-full max-h-full object-contain rounded" />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {customer.nombres} {customer.apellidos}
            </h1>
            <p className="text-gray-600">RUT: {customer.rut}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2 bg-transparent">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteClick}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 bg-transparent"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">Información Básica</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Datos Personales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Datos Personales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombres</label>
                  <p className="text-lg font-medium">{customer.nombres}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">Apellidos</label>
                  <p className="text-lg font-medium">{customer.apellidos}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500">RUT</label>
                  <Badge variant="outline" className="font-mono text-base">
                    {customer.rut}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-lg">{customer.email}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </label>
                  <p className="text-lg font-mono">{customer.telefono}</p>
                </div>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dirección
                  </label>
                  <p className="text-lg">{customer.direccion}</p>
                </div>
              </CardContent>
            </Card>

            {/* Información de Registro */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Información de Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                  <p className="text-lg">
                    {new Date(customer.createdAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Última Actualización</label>
                  <p className="text-lg">
                    {new Date(customer.updatedAt).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DocumentPreview url={customer.contratoUrl} label="Contrato" />
            <DocumentPreview url={customer.fotoCi} label="Foto Cédula de Identidad" />
            <DocumentPreview url={customer.fotoLicencia} label="Foto Licencia de Conducir" />
            <DocumentPreview url={customer.hojaAntecedentes} label="Hoja de Antecedentes" />
            <DocumentPreview url={customer.hojaConductor} label="Hoja de Conductor" />
            <DocumentPreview url={customer.eRut} label="e-RUT" />
          </div>
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el cliente{" "}
              <strong>
                {customer.nombres} {customer.apellidos}
              </strong>{" "}
              y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
