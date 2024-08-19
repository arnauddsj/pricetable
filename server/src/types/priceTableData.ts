import { Product } from "./entities"
import { FeatureGroup } from "./entities"

export interface PriceTableDataType {
  publishedAt: Date
  data: PublishedData
}

export interface PaymentType {
  name: string
  type: 'cycle' | 'one-time' | 'usage-based'
  unitName: string
  usageBasedConfig?: {
    min?: number
    max?: number
    step?: number
  } | null
}


export interface PublishedData {
  htmlTemplate: string
  customCSS: Record<string, any>
  currencySettings: {
    baseCurrency: string
    availableCurrencies: string[]
  }
  paymentTypes: PaymentType[]
  products: Product[]
  featureGroups: FeatureGroup[]
}
