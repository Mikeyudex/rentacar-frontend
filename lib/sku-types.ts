export interface SkuCorrelative {
  id: string
  name: string
  createdAt: Date
  createdBy: string
}

export interface CreateSkuCorrelativeRequest {
  name: string
}

export interface CreateSkuCorrelativeResponse {
  success: boolean
  data?: SkuCorrelative
  message: string
}
