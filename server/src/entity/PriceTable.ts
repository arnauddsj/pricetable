import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { User } from "./User"

@Entity()
export class PriceTable {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @ManyToOne(() => User, user => user.priceTables)
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

  @ManyToOne(() => PriceTableTemplate)
  template: PriceTableTemplate

  @Column({ nullable: true })
  templateId: string

  @OneToMany(() => Product, product => product.priceTable)
  products: Product[]

  @OneToMany(() => FeatureGroup, featureGroup => featureGroup.priceTable)
  featureGroups: FeatureGroup[]

  @Column({ nullable: true })
  stripePublicKey: string

  @Column({ nullable: true })
  paddlePublicKey: string

  @Column({ default: false })
  useLocalization: boolean
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

  @Column({ nullable: true })
  highlightText: string

  @Column()
  buttonText: string

  @Column()
  buttonLink: string

  @Column({ nullable: true })
  stripeProductId: string

  @Column({ nullable: true })
  paddleProductId: string

  @ManyToOne(() => PriceTable, priceTable => priceTable.products)
  priceTable: PriceTable

  @ManyToMany(() => Feature)
  @JoinTable()
  features: Feature[]
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
  billingCycle: string

  @Column({ nullable: true })
  checkoutUrl: string //override the buttonLink

  @Column({ default: false })
  overrideLocalization: boolean
  // will check first if any stripe/paddle localization is set, if not will use the countryPrices

  @OneToMany(() => CountryPrice, countryPrice => countryPrice.price)
  countryPrices: CountryPrice[]
}

@Entity()
export class CountryPrice {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => Price, price => price.countryPrices)
  price: Price

  @Column()
  countryCode: string

  @Column("decimal", { precision: 10, scale: 2 })
  unitAmount: number

  @Column()
  currency: string
}

@Entity()
export class Discount {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  description: string

  @Column({ nullable: true })
  code: string // if strip/paddle not set to retrieve discounts

  @Column()
  type: 'percentage' | 'fixed_amount'

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number

  @Column()
  baseCurrency: string //This represents the primary currency in which the discount is defined.

  @Column("json")
  localizedAmounts: {
    [currencyCode: string]: number
  }

  @Column({ nullable: true })
  expiresAt?: Date

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

  @Column({ nullable: true })
  imageUrl: string

  @ManyToOne(() => PriceTable, priceTable => priceTable.featureGroups)
  priceTable: PriceTable

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

  @Column({ nullable: true })
  imageUrl: string

  @ManyToOne(() => FeatureGroup, group => group.features)
  group: FeatureGroup
}

@Entity()
export class PriceTableTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: true })
  name: string

  @Column("jsonb")
  styling: Record<string, any>

  @Column()
  isPublic: boolean

  @ManyToOne(() => User, { nullable: true })
  user: User | null

  @ManyToOne(() => PriceTableTemplate, { nullable: true })
  originalTemplate: PriceTableTemplate | null

  @Column({ nullable: true })
  originalTemplateId: string | null

  @OneToMany(() => PriceTable, priceTable => priceTable.template)
  priceTables: PriceTable[]

  @Column()
  version: string

  @Column("text")
  htmlTemplate: string //stores the version of the HTML template.

  @Column("text")
  vueComponent: string //stores the version of the PriceTablePreview component.
}