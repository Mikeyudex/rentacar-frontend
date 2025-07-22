export interface Category {
    id: number
    name: string
    slug: string
    parent: number | null
    children?: Category[]
}

export interface CategoryWoo {
    id: number
}

// Tipos para los productos
export interface Product {
    id: string
    sku: string
    nombre: string
    categorias: Category[]
    modelo: string
    precio: number
    stock: number
    ubicacion?: string
    numeroParte?: string
    imagenes?: string[]
}

// Tipos para la respuesta paginada
export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        currentPage: number
        totalPages: number
        totalItems: number
        itemsPerPage: number
    }
}

// Parámetros para la paginación
export interface PaginationParams {
    page: number
    limit: number
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
}

export interface CreateProductWoocommerce {
    sku: string;
    name: string;
    slug?: string;
    description?: string;
    short_description?: string;
    price?: string;
    regular_price: string;
    sale_price?: number;
    date_on_sale_from?: string;
    date_on_sale_from_gmt?: string;
    date_on_sale_to?: string;
    date_on_sale_to_gmt?: string;
    on_sale?: boolean;
    purchasable?: boolean;
    total_sales?: number;
    virtual?: boolean;
    downloadable?: boolean;
    downloads?: any[];
    external_url?: string;
    button_text?: string;
    tax_status?: string;
    tax_class?: string;
    manage_stock?: boolean;
    stock_quantity?: number;
    stock_status?: string;
    backorders?: string;
    backorders_allowed?: boolean;
    backordered?: boolean;
    sold_individually?: boolean;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    shipping_required?: boolean;
    shipping_taxable?: boolean;
    shipping_class?: string;
    shipping_class_id?: number;
    reviews_allowed?: boolean;
    average_rating?: number;
    rating_count?: number;
    categories: {
        id: number;
        name?: string;
        slug?: string;
    }[];
    tags?: Tags[];
    images: WooImages[];
    attributes?: any[];
    default_attributes?: any[];
    variations?: any[];
    grouped_products?: any[];
    menu_order?: number;
    meta_data?: any[];
    user_id?: string;
}

export interface Tags {
    id: number
    name: string
    slug: string
}

export interface WooImages {
    id?: number
    src: string
}

export type DroppedFile = {
  file: File
  preview: string
}