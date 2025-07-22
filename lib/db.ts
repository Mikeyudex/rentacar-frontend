import Dexie, { Table } from "dexie";
import type { Category } from "@/lib/types";

class AppDB extends Dexie {
  categories!: Table<Category, number>;

  constructor() {
    super("AppDB");
    this.version(1).stores({
      categories: "id, name, parent"
    });
  }
}

export const db = new AppDB();