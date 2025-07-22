import React, { useState, useEffect, useMemo } from "react"
import type { Category } from "@/lib/types"


interface CategoryTreeSelectorProps {
    categories: Category[]
    selectedCategories: Category[]
    onSelectionChange: (selected: Category[]) => void
}

export function CategoryTreeSelector({
    categories,
    selectedCategories,
    onSelectionChange,
}: CategoryTreeSelectorProps) {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");

    // Convierte array a Set de ids para selección rápida
    const selectedIds = new Set(selectedCategories.map((c) => c.id))

    const toggleExpand = (id: number) => {
        const newExpanded = new Set(expanded)
        if (newExpanded.has(id)) {
            newExpanded.delete(id)
        } else {
            newExpanded.add(id)
        }
        setExpanded(newExpanded)
    }

    // Marca o desmarca recursivamente todos los hijos de una categoría
    const getAllDescendantIds = (category: Category): number[] => {
        let ids: number[] = []
        if (category.children && category.children.length > 0) {
            for (const child of category.children) {
                ids.push(child.id)
                ids = ids.concat(getAllDescendantIds(child))
            }
        }
        return ids
    }

    // Comprueba si todos los hijos están seleccionados (para marcar padre)
    const areAllChildrenSelected = (category: Category): boolean => {
        if (!category.children || category.children.length === 0) return false
        return category.children.every(
            (child) =>
                selectedIds.has(child.id) || areAllChildrenSelected(child)
        )
    }

    // Chequea si está seleccionado (padre o hijo)
    const isChecked = (category: Category): boolean => {
        if (selectedIds.has(category.id)) return true
        // Si es padre y todos los hijos seleccionados, marcamos también el padre
        if (category.children && category.children.length > 0) {
            return areAllChildrenSelected(category)
        }
        return false
    }

    const toggleCategory = (category: Category) => {
        const newSelected = new Set(selectedIds)
        const descendantIds = getAllDescendantIds(category)
        const parentIds = getImmediateParentId(category)

        if (isChecked(category)) {
            // Desmarcar categoría, hijos y padres
            newSelected.delete(category.id)
            descendantIds.forEach(id => newSelected.delete(id))
            parentIds.forEach(id => newSelected.delete(id))
        } else {
            // Marcar categoría, hijos y padres
            newSelected.add(category.id)
            descendantIds.forEach(id => newSelected.add(id))
            parentIds.forEach(id => newSelected.add(id))
        }

        const updatedSelected = allCategoriesFlat.filter(cat => newSelected.has(cat.id))
        onSelectionChange(updatedSelected)
    }

    // Función para "aplanar" árbol a lista para obtener categorías por id
    const flattenCategories = (category: Category): Category[] => {
        let result = [category]
        if (category.children && category.children.length > 0) {
            for (const child of category.children) {
                result = result.concat(flattenCategories(child))
            }
        }
        return result
    }
    const allCategoriesFlat = useMemo(
        () => categories.flatMap(flattenCategories),
        [categories]
    )

    const categoryMap = useMemo(() => {
        const map = new Map<number, Category>()
        for (const cat of allCategoriesFlat) {
            map.set(cat.id, cat)
        }
        return map
    }, [allCategoriesFlat])

    const getImmediateParentId = (category: Category): number[] => {
        return category.parent ? [category.parent] : []
    }

    const filterCategories = (cats: Category[], term: string): Category[] => {
        if (!term.trim()) return cats
        term = term.toLowerCase()

        return cats
            .map(cat => {
                const children = cat.children ? filterCategories(cat.children, term) : []
                const match = cat.name.toLowerCase().includes(term) || cat.slug.toLowerCase().includes(term)
                if (match || children.length > 0) {
                    return { ...cat, children }
                }
                return null
            })
            .filter(Boolean) as Category[]
    }

    const filteredCategories = useMemo(
        () => filterCategories(categories, searchTerm),
        [categories, searchTerm]
    )


    const renderTree = (nodes: Category[], depth = 0) => {
        return nodes.map(cat => {
            const isParent = cat.children && cat.children.length > 0

            return (
                <div key={cat.id} className={`ml-${depth * 4}`}>
                    <div
                        className={`flex items-center gap-2 ${isParent ? "sticky top-0 bg-white z-10 py-1" : ""
                            }`}
                    >
                        {isParent && (
                            <button
                                type="button"
                                onClick={() => toggleExpand(cat.id)}
                                className="text-xs text-muted-foreground hover:underline"
                            >
                                {expanded.has(cat.id) ? "▾" : "▸"}
                            </button>
                        )}
                        {!cat.children || cat.children.length === 0 ? <span className="w-4" /> : null}

                        <input
                            type="checkbox"
                            id={`cat-${cat.id}`}
                            checked={isChecked(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="cursor-pointer"
                        />
                        <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium select-none">
                            {cat.name}
                        </label>
                    </div>

                    {expanded.has(cat.id) && cat.children && (
                        <div className="ml-4 space-y-1">{renderTree(cat.children, depth + 1)}</div>
                    )}
                </div>
            )
        })
    }

    return (
        <div className="border rounded-md bg-white space-y-2">
            {/* Buscador sticky */}
            <div className="sticky top-0 z-20 bg-white p-2 border-b">
                <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                />
                {searchTerm && (
                    <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                        aria-label="Limpiar búsqueda"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Scrollable area con árbol */}
            <div className="max-h-96 overflow-y-auto px-2 pb-2">
                {filteredCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No se encontraron categorías.</p>
                ) : (
                    renderTree(filteredCategories)
                )}
            </div>
        </div>
    )
}
