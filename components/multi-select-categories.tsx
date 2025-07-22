"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@/lib/types"

interface MultiSelectCategoriesProps {
  id: string
  categories: Category[]
  selectedCategories: Category[]
  onSelectionChange: (categories: Category[]) => void
  placeholder?: string
}

export function MultiSelectCategories({
  id,
  categories,
  selectedCategories,
  onSelectionChange,
  placeholder = "Seleccionar categorías...",
}: MultiSelectCategoriesProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (category: Category) => {
    const isSelected = selectedCategories.some((selected) => selected.id === category.id)

    if (isSelected) {
      // Remover categoría
      onSelectionChange(selectedCategories.filter((selected) => selected.id !== category.id))
    } else {
      // Agregar categoría
      onSelectionChange([...selectedCategories, category])
    }
  }

  const handleRemoveCategory = (categoryId: string) => {
    onSelectionChange(selectedCategories.filter((selected) => selected.id !== categoryId))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between" id={id}>
            {selectedCategories.length > 0
              ? `${selectedCategories.length} categoría${selectedCategories.length > 1 ? "s" : ""} seleccionada${
                  selectedCategories.length > 1 ? "s" : ""
                }`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar categorías..." />
            <CommandList>
              <CommandEmpty>No se encontraron categorías.</CommandEmpty>
              <CommandGroup>
                {categories.map((category) => {
                  const isSelected = selectedCategories.some((selected) => selected.id === category.id)
                  return (
                    <CommandItem key={category.id} value={category.slug} onSelect={() => handleSelect(category)}>
                      <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                      {category.name}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Mostrar categorías seleccionadas como badges */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <Badge key={category.id} variant="secondary" className="flex items-center gap-1">
              {category.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveCategory(category.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remover {category.name}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
