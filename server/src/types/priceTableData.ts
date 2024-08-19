export interface PriceTableData {
  versionId: string
  publishedAt: Date
  data: PublishedData
}

export interface PublishedData {
  name: string
  currencySettings: {
    baseCurrency: string
    availableCurrencies: string[]
  }
  paymentTypes: {
    name: string
    type: 'cycle' | 'one-time' | 'usage-based'
    unitName: string
    usageBasedConfig?: {
      min?: number
      max?: number
      step?: number
    } | null
  }[]
  products: {
    id: string
    name: string
    description: string
    isHighlighted: boolean
    highlightText?: string
    buttonText?: string
    buttonLink?: string
    stripeProductId?: string
    paddleProductId?: string
    prices: {
      id: string
      paymentTypeName: string
      unitAmount: number
      currency: string
      checkoutUrl?: string
    }[]
  }[]
  featureGroups: {
    id: string
    name: string
    description: string
    imageUrl?: string
    features: {
      id: string
      name: string
      description: string
      imageUrl?: string
      availableFeatureIconUrl?: string
      unavailableFeatureIconUrl?: string
    }[]
  }[]
}