import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, OneToOne, UpdateDateColumn, CreateDateColumn } from "typeorm"
import { User } from "./User"
import { PriceTableTemplate } from "./PriceTableTemplate"
import { Product } from "./Product"
import { FeatureGroup } from "./FeatureGroup"
import { PriceTableDraft } from "./PriceTableDraft"

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

  @OneToMany(() => Product, product => product.priceTable, { cascade: true })
  products: Product[]

  @OneToMany(() => FeatureGroup, featureGroup => featureGroup.priceTable, { cascade: true })
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

  @Column({ default: false })
  isPublished: boolean

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null

  @OneToOne(() => PriceTableDraft, draft => draft.priceTable, { cascade: true })
  draft: PriceTableDraft

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}