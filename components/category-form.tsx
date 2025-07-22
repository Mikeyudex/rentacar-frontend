"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

//import { createCategory } from "@/services/category-service"

export function CategoryForm() {
  const router = useRouter()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

  // Función para generar slug automáticamente
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remover acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remover caracteres especiales
      .replace(/\s+/g, "-") // Reemplazar espacios con guiones
      .replace(/-+/g, "-") // Remover guiones duplicados
      .trim()
  }

  // Manejar cambio en el nombre
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)

    // Generar slug automáticamente si no se ha modificado manualmente
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(newName))
    }
  }

/*   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validaciones básicas
      if (!name.trim() || !slug.trim()) {
        toast({
          title: "Error de validación",
          description: "Por favor complete todos los campos obligatorios",
          variant: "destructive",
        })
        return
      }

      await createCategory({
        name: name.trim(),
        slug: slug.trim(),
      })

      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente",
      })

      router.push("/categorias")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  } */

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {/* <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                placeholder="Ingrese el nombre de la categoría"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-de-la-categoria"
                required
              />
              <p className="text-sm text-muted-foreground">
                El slug se usa en URLs y debe ser único. Se genera automáticamente basado en el nombre.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => router.back()} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Categoría
              </Button>
            </div>
          </form> */}
        </CardContent>
      </Card>
    </div>
  )
}
