import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Category, CategoryWoo, DroppedFile, Tags, WooImages } from "./types";
import { User } from "./auth-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const numberFormatPrice = (value = 0) => {

  let USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  let operator = USDollar.format(value).split(".")[0]

  return operator;
};

export const createTag = (name: string): Tags => {
  return {
    id: Date.now(),
    name: name,
    slug: createSlug(name),
  };
};

export const createSlug = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remover caracteres especiales
    .replace(/\s+/g, "-") // Reemplazar espacios con guiones
    .replace(/-+/g, "-") // Remover guiones duplicados
    .trim();
};

export const homologateCategory = (categories: Category[], vehiculo?: string): CategoryWoo[] => {

  let homologatedCategories: CategoryWoo[] = [];

  categories.forEach((category) => {
    let homologatedCategory: CategoryWoo = {
      id: category.id,
    };
    homologatedCategories.push(homologatedCategory);
  });
  homologatedCategories.push({
    id: parseInt(vehiculo!),
  });
  return homologatedCategories;
};

export const homologateImages = (images: string[]): WooImages[] => {
  let homologatedImages: WooImages[] = [];

  images.forEach((image) => {
    let homologatedImage: WooImages = {
      id: Date.now(),
      src: image,
    };
    homologatedImages.push(homologatedImage);
  });

  return homologatedImages;
};

export function getModelSearchCategories(categories: Category[], parentCat: string): Category[] {
  const targetParent = categories.find(cat => cat.name.toLowerCase() === parentCat.toLowerCase());

  if (!targetParent) return [];

  // Devolver las subcategorías (hijos directos)
  return targetParent.children || [];
}

export function getPermissions(user: any): string[] {
  if (!user) return ["read"];
  let permissions: string[] = ["read"];
  if (user?.rol === "admin") permissions.push("write", "delete");
  if (user?.role === "operativo") permissions.push("read", "write");
  return permissions;
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

export const createDroppedFiles = (files: File[]): DroppedFile[] =>
  files.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
  }))
