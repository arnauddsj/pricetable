import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, Unique } from "typeorm"
import { User } from "./User"

@Entity()
export class PriceTable {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @ManyToOne(() => User, user => user.priceTables)
  user: User

  @Column({ nullable: true })
  templateId: string

  @Column({ nullable: true })
  stripePublicKey: string

  @Column({ nullable: true })
  paddlePublicKey: string

  @Column("simple-array", { default: "USD" })
  availableCurrencies: string[]

  @ManyToOne(() => PriceTableTemplate)
  template: PriceTableTemplate

  @OneToMany(() => Product, product => product.priceTable)
  products: Product[]

  @OneToMany(() => FeatureGroup, featureGroup => featureGroup.priceTable)
  featureGroups: FeatureGroup[]

  @OneToMany(() => PaymentType, paymentType => paymentType.priceTable)
  paymentTypes: PaymentType[]
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column("text")
  description: string

  @Column()
  isHighlighted: boolean

  @Column({ nullable: true })
  highlightText: string

  @Column()
  buttonText: string

  @Column()
  buttonLink: string //Link can be overridden by price

  @Column({ nullable: true })
  stripeProductId: string

  @Column({ nullable: true })
  paddleProductId: string

  @ManyToOne(() => PriceTable, priceTable => priceTable.products)
  priceTable: PriceTable

  @OneToMany(() => Price, price => price.product)
  prices: Price[]

  @ManyToMany(() => Feature)
  @JoinTable()
  features: Feature[]
}

@Entity()
@Unique(['product', 'paymentType', 'currency'])  // Ensure one price per product per paymentType per currency
export class Price {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => Product, product => product.prices)
  product: Product

  @ManyToOne(() => PaymentType)
  paymentType: PaymentType

  @Column("decimal", { precision: 10, scale: 2 })
  unitAmount: number

  @Column()
  currency: string

  @Column({ nullable: true })
  checkoutUrl: string //override the buttonLink

  @Column("jsonb", { nullable: true })
  usageTiers: {
    upTo: number
    unitAmount: number
  }[] | null
}

@Entity()
export class PaymentType {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column()
  type: 'cycle' | 'one-time' | 'usage-based'

  @Column()
  unitName: string

  @Column("json", { nullable: true })
  usageBasedConfig: {
    min?: number
    max?: number
    step?: number
  } | null

  @ManyToOne(() => PriceTable, priceTable => priceTable.paymentTypes)
  priceTable: PriceTable
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

  @Column({ nullable: true })
  availableFeatureIconUrl: string

  @Column({ nullable: true })
  unavailableFeatureIconUrl: string

  @ManyToOne(() => FeatureGroup, group => group.features)
  group: FeatureGroup
}

@Entity()
export class PriceTableTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: true })
  name: string

  @Column({
    type: "enum",
    enum: ["admin", "community"],
    default: "community"
  })
  templateSource: "admin" | "community"

  @Column({ default: false })
  isPublic: boolean // If true, the template is available to all users, it's like isPublished

  @Column({ default: false })
  isFeatured: boolean

  @Column({ default: false })
  isPremium: boolean

  @Column({ unique: true })
  version: string

  @Column({ nullable: true })
  availableFeatureIconUrl: string

  @Column({ nullable: true })
  unavailableFeatureIconUrl: string

  @Column("jsonb")
  customCSS: Record<string, any>

  @Column({ nullable: true })
  originalTemplateId: string | null

  @ManyToOne(() => User, { nullable: true })
  user: User | null

  @ManyToOne(() => PriceTableTemplate, { nullable: true })
  originalTemplate: PriceTableTemplate | null

  @OneToMany(() => PriceTable, priceTable => priceTable.template)
  priceTables: PriceTable[]

}