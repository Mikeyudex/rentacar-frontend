import { useEffect, useState } from "react";
import { db } from "@/lib/db";
import type { Category } from "@/lib/types";
import { getTreeCategories } from "@/services/category-service";
import { getModelSearchCategories } from "@/lib/utils";

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [modelCategories, setModelCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadFromCacheOrFetch = async () => {
            // 1. Intenta cargar desde IndexedDB
            const cached = await db.categories.toArray();
            if (cached.length > 0) {
                if (isMounted) {
                    let modelCategories = getModelSearchCategories(cached, "BUSQUEDA POR MODELO");
                    setModelCategories(modelCategories);
                    setCategories(cached)
                };
                setLoading(false);
            }

            // 2. Fetch desde backend
            try {
                const data = await getTreeCategories();
                // 3. Guarda y actualiza UI
                await db.categories.clear();
                await db.categories.bulkPut(data);

                if (isMounted) {
                    let modelCategories = getModelSearchCategories(data, "BUSQUEDA POR MODELO");
                    setModelCategories(modelCategories);
                    setCategories(data);
                    setLoading(false);
                }
            } catch (e) {
                console.error("Error loading categories:", e);
                setLoading(false);
            }
        };

        loadFromCacheOrFetch();
        return () => {
            isMounted = false;
        };
    }, []);

    return { availableCategories: categories, isLoadingCategories: loading, modelCategories: modelCategories };
}
