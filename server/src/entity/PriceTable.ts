import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { User } from "./User"
import { PriceTableTemplate } from "./PriceTableTemplate"
import { Product } from "./Product"
import { FeatureGroup } from "./FeatureGroup"

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

  @Column("jsonb", {
    default: {
      baseCurrency: "USD",
      availableCurrencies: ["USD"]
    }
  })
  currencySettings: {
    baseCurrency: string
    availableCurrencies: string[]
  }

  @ManyToOne(() => PriceTableTemplate)
  template: PriceTableTemplate

  @OneToMany(() => Product, product => product.priceTable)
  products: Product[]

  @OneToMany(() => FeatureGroup, featureGroup => featureGroup.priceTable)
  featureGroups: FeatureGroup[]

  @Column("jsonb", {
    default: [
      {
        name: "Month",
        type: "cycle",
        unitName: "/month"
      }
    ]
  })
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
}