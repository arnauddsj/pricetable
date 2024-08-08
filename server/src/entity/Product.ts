import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { User } from "./User"

@Entity()
export class ProductTable {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @ManyToOne(() => User, user => user.productTables)
  user: User

  @Column("json")
  generalSettings: {
    baseCurrency: string
    availableCurrencies: string[]
    generalStyle: string
    templateId?: string
    iconStyle: 'icon' | 'text'
    paymentType: 'cycles' | 'one-time' | 'usage-based'
    cycleOptions?: string[] // e.g., ["month", "year"]
    usageRanges?: { min: number; max: number; price: number }[]
  }

  @OneToMany(() => Product, product => product.productTable)
  products: Product[]

  @OneToMany(() => FeatureGroup, featureGroup => featureGroup.productTable)
  featureGroups: FeatureGroup[]

  @Column()
  stripePublicKey: string

  @Column()
  paddlePublicKey: string

  @Column("json")
  localizationSettings: {
    enableAutomaticCurrencyConversion: boolean
    countrySpecificPricing: { [countryCode: string]: string } // e.g., { "GB": "GBP", "BR": "USD" }
  }
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column("text")
  description: string

  @OneToMany(() => Price, price => price.product)
  prices: Price[]

  @Column()
  isHighlighted: boolean

  @Column()
  highlightText: string

  @Column("json")
  buttonSettings: {
    text: string
    link: string
  }

  @ManyToOne(() => ProductTable, productTable => productTable.products)
  productTable: ProductTable

  @ManyToMany(() => Feature)
  @JoinTable()
  features: Feature[]

  @Column()
  stripeProductId: string

  @Column()
  paddleProductId: string
}

@Entity()
export class Price {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => Product, product => product.prices)
  product: Product

  @Column("decimal", { precision: 10, scale: 2 })
  unitAmount: number

  @Column()
  currency: string

  @Column()
  billingCycle: 'one-time' | 'monthly' | 'yearly' | 'custom'

  @Column({ nullable: true })
  customInterval?: string // For custom billing cycles

  @Column("json")
  trialPeriod: {
    enabled: boolean
    days: number
  }

  @Column("json")
  countryOverrides: {
    [countryCode: string]: {
      unitAmount: number
      currency: string
    }
  }
}

@Entity()
export class Discount {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  code: string

  @Column()
  description: string

  @Column()
  type: 'percentage' | 'fixed_amount'

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number

  @Column()
  currency: string

  @Column()
  isRecurring: boolean

  @Column({ nullable: true })
  recurringPeriods?: number

  @Column({ nullable: true })
  expiresAt?: Date

  @Column()
  usageLimit: number

  @Column()
  timesUsed: number

  @ManyToMany(() => Product)
  @JoinTable()
  applicableProducts: Product[]
}

@Entity()
export class FeatureGroup {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column("text")
  description: string

  @Column()
  imageUrl: string

  @ManyToOne(() => ProductTable, productTable => productTable.featureGroups)
  productTable: ProductTable

  @OneToMany(() => Feature, feature => feature.group)
  features: Feature[]
}

@Entity()
export class Feature {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column("text")
  description: string

  @Column()
  imageUrl: string

  @ManyToOne(() => FeatureGroup, group => group.features)
  group: FeatureGroup
}