// Utilidades para IndexedDB
const DB_NAME = "erp_auth_db"
const DB_VERSION = 1
const STORE_NAME = "auth_store"

interface AuthData {
  id: string
  user: any
  token: string
  refreshToken: string
  expiresAt: number
}

class IndexedDBManager {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" })
          store.createIndex("token", "token", { unique: false })
        }
      }
    })
  }

  async setAuthData(data: Omit<AuthData, "id">): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)

      const authData: AuthData = {
        id: "current_user",
        ...data,
      }

      const request = store.put(authData)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getAuthData(): Promise<AuthData | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get("current_user")

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        if (result && result.expiresAt > Date.now()) {
          resolve(result)
        } else {
          resolve(null)
        }
      }
    })
  }

  async clearAuthData(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete("current_user")

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async isTokenValid(): Promise<boolean> {
    const authData = await this.getAuthData()
    return authData !== null && authData.expiresAt > Date.now()
  }
}

export const indexedDBManager = new IndexedDBManager()
