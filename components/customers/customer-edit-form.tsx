"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { customerService } from "@/services/customer-service"
import type { Customer, CreateCustomerData } from "@/lib/customer-types"
import { ArrowLeft, Upload, X, FileText, User, Mail, Phone, MapPin, CreditCard, RotateCcw } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const customerSchema = z.object({
  nombres: z
    .string()
    .min(2, "Los nombres deben tener al menos 2 caracteres")
    .max(50, "Los nombres no pueden exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
  apellidos: z
    .string()
    .min(2, "Los apellidos deben tener al menos 2 caracteres")
    .max(50, "Los apellidos no pueden exceder 50 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios"),
  rut: z
    .string()
    .min(9, "El RUT debe tener al menos 9 caracteres")
    .max(12, "El RUT no puede exceder 12 caracteres")
    .regex(/^[0-9]+[-][0-9kK]{1}$/, "Formato de RUT inválido (ej: 12345678-9)"),
  direccion: z
    .string()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  email: z.string().email("Formato de email inválido").max(100, "El email no puede exceder 100 caracteres"),
  telefono: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos")
    .regex(/^[+]?[0-9\s-()]+$/, "Formato de teléfono inválido"),
  contratoUrl: z.string().min(1, "El contrato es obligatorio"),
})

type CustomerFormData = z.infer<typeof customerSchema>

interface FileUploadState {
  file: File | null
  url: string
  uploading: boolean
  progress: number
}

interface CustomerEditFormProps {
  customerId: string
}

export default function CustomerEditForm({ customerId }: CustomerEditFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Estados para archivos opcionales
  const [fotoCi, setFotoCi] = useState<FileUploadState>({ file: null, url: "", uploading: false, progress: 0 })
  const [fotoLicencia, setFotoLicencia] = useState<FileUploadState>({
    file: null,
    url: "",
    uploading: false,
    progress: 0,
  })
  const [hojaAntecedentes, setHojaAntecedentes] = useState<FileUploadState>({
    file: null,
    url: "",
    uploading: false,
    progress: 0,
  })
  const [hojaConductor, setHojaConductor] = useState<FileUploadState>({
    file: null,
    url: "",
    uploading: false,
    progress: 0,
  })
  const [eRut, setERut] = useState<FileUploadState>({ file: null, url: "", uploading: false, progress: 0 })

  // Estado para archivo obligatorio
  const [contrato, setContrato] = useState<FileUploadState>({ file: null, url: "", uploading: false, progress: 0 })

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      rut: "",
      direccion: "",
      email: "",
      telefono: "",
      contratoUrl: "",
    },
  })

  const { isDirty, dirtyFields } = form.formState

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true)
        const customerData = await customerService.getCustomerById(customerId)
        setCustomer(customerData)

        // Poblar el formulario
        form.reset({
          nombres: customerData.nombres,
          apellidos: customerData.apellidos,
          rut: customerData.rut,
          direccion: customerData.direccion,
          email: customerData.email,
          telefono: customerData.telefono,
          contratoUrl: customerData.contratoUrl,
        })

        // Poblar estados de archivos
        setFotoCi((prev) => ({ ...prev, url: customerData.fotoCi || "" }))
        setFotoLicencia((prev) => ({ ...prev, url: customerData.fotoLicencia || "" }))
        setHojaAntecedentes((prev) => ({ ...prev, url: customerData.hojaAntecedentes || "" }))
        setHojaConductor((prev) => ({ ...prev, url: customerData.hojaConductor || "" }))
        setERut((prev) => ({ ...prev, url: customerData.eRut || "" }))
        setContrato((prev) => ({ ...prev, url: customerData.contratoUrl }))
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
  }, [customerId, form, router, toast])

  const handleFileUpload = async (
    file: File,
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>,
    fieldName?: keyof CustomerFormData,
  ) => {
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description: "Solo se permiten archivos PDF, JPG y PNG",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo no puede exceder 10MB",
        variant: "destructive",
      })
      return
    }

    setState((prev) => ({ ...prev, file, uploading: true, progress: 0 }))

    try {
      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setState((prev) => {
          if (prev.progress >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return { ...prev, progress: prev.progress + 10 }
        })
      }, 100)

      const url = await customerService.uploadFile(file)

      setState((prev) => ({ ...prev, url, uploading: false, progress: 100 }))

      // Actualizar el formulario si es un campo obligatorio
      if (fieldName) {
        form.setValue(fieldName, url, { shouldDirty: true })
      }

      toast({
        title: "Archivo subido exitosamente",
        description: `${file.name} se ha subido correctamente`,
      })
    } catch (error) {
      setState((prev) => ({ ...prev, uploading: false, progress: 0 }))
      toast({
        title: "Error al subir archivo",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    }
  }

  const removeFile = (
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>,
    fieldName?: keyof CustomerFormData,
  ) => {
    setState((prev) => ({ ...prev, file: null, url: "" }))
    if (fieldName) {
      form.setValue(fieldName, "", { shouldDirty: true })
    }
  }

  const handleRestore = () => {
    if (!customer) return

    form.reset({
      nombres: customer.nombres,
      apellidos: customer.apellidos,
      rut: customer.rut,
      direccion: customer.direccion,
      email: customer.email,
      telefono: customer.telefono,
      contratoUrl: customer.contratoUrl,
    })

    // Restaurar estados de archivos
    setFotoCi({ file: null, url: customer.fotoCi || "", uploading: false, progress: 0 })
    setFotoLicencia({ file: null, url: customer.fotoLicencia || "", uploading: false, progress: 0 })
    setHojaAntecedentes({ file: null, url: customer.hojaAntecedentes || "", uploading: false, progress: 0 })
    setHojaConductor({ file: null, url: customer.hojaConductor || "", uploading: false, progress: 0 })
    setERut({ file: null, url: customer.eRut || "", uploading: false, progress: 0 })
    setContrato({ file: null, url: customer.contratoUrl, uploading: false, progress: 0 })

    toast({
      title: "Cambios restaurados",
      description: "Se han restaurado los valores originales",
    })
  }

  const onSubmit = async (data: CustomerFormData) => {
    if (!customer) return

    setIsSaving(true)

    try {
      const updateData: Partial<CreateCustomerData> = {
        ...data,
        fotoCi: fotoCi.url || undefined,
        fotoLicencia: fotoLicencia.url || undefined,
        hojaAntecedentes: hojaAntecedentes.url || undefined,
        hojaConductor: hojaConductor.url || undefined,
        eRut: eRut.url || undefined,
        contratoUrl: contrato.url,
      }

      await customerService.updateCustomer(customer.id, updateData)

      toast({
        title: "Cliente actualizado exitosamente",
        description: `${data.nombres} ${data.apellidos} ha sido actualizado correctamente`,
      })

      router.push(`/clientes/${customer.id}`)
    } catch (error) {
      toast({
        title: "Error al actualizar cliente",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?")
      if (!confirmed) return
    }
    router.back()
  }

  const FileUploadComponent = ({
    label,
    state,
    setState,
    fieldName,
    required = false,
    icon: Icon = FileText,
  }: {
    label: string
    state: FileUploadState
    setState: React.Dispatch<React.SetStateAction<FileUploadState>>
    fieldName?: keyof CustomerFormData
    required?: boolean
    icon?: any
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {!state.file && !state.url ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleFileUpload(file, setState, fieldName)
              }
            }}
            className="hidden"
            id={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
          />
          <label
            htmlFor={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">Haz clic para subir {label.toLowerCase()}</span>
            <span className="text-xs text-gray-500">PDF, JPG, PNG (máx. 10MB)</span>
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-3 bg-gray-50">
          {state.uploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Subiendo...</span>
                <span className="text-sm text-gray-500">{state.progress}%</span>
              </div>
              <Progress value={state.progress} className="h-2" />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">{state.file?.name || "Archivo actual"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const input = document.getElementById(
                        `file-${label.replace(/\s+/g, "-").toLowerCase()}`,
                      ) as HTMLInputElement
                      input?.click()
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Reemplazar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(setState, fieldName)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file, setState, fieldName)
                  }
                }}
                className="hidden"
                id={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )

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

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Cliente</h1>
          <p className="text-gray-600">
            {customer.nombres} {customer.apellidos} - {customer.rut}
          </p>
        </div>
      </div>

      {isDirty && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Tienes cambios sin guardar. No olvides hacer clic en "Guardar Cambios" para conservar tus modificaciones.
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nombres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres *</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Carlos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="apellidos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos *</FormLabel>
                    <FormControl>
                      <Input placeholder="González Pérez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      RUT *
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="12345678-9"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toUpperCase()
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Teléfono *
                    </FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+56912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email *
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="cliente@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Dirección *
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Av. Providencia 1234, Santiago"
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadComponent
                label="Contrato"
                state={contrato}
                setState={setContrato}
                fieldName="contratoUrl"
                required={true}
                icon={FileText}
              />

              <FileUploadComponent
                label="Foto Cédula de Identidad"
                state={fotoCi}
                setState={setFotoCi}
                icon={CreditCard}
              />

              <FileUploadComponent
                label="Foto Licencia de Conducir"
                state={fotoLicencia}
                setState={setFotoLicencia}
                icon={CreditCard}
              />

              <FileUploadComponent
                label="Hoja de Antecedentes"
                state={hojaAntecedentes}
                setState={setHojaAntecedentes}
                icon={FileText}
              />

              <FileUploadComponent
                label="Hoja de Conductor"
                state={hojaConductor}
                setState={setHojaConductor}
                icon={FileText}
              />

              <FileUploadComponent label="e-RUT" state={eRut} setState={setERut} icon={FileText} />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              {isDirty && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRestore}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restaurar
                </Button>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving || !isDirty || !contrato.url} className="min-w-[140px]">
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
