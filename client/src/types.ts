export interface PaymentTypeData {
  name: string
  type: 'cycle' | 'one-time' | 'usage-based'
  unitName: string
  usageBasedConfig?: {
    min: number
    max: number
    step: number
  }
}