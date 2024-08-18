import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { User } from "./User"
import { PriceTable } from "./PriceTable"

@Entity()
export class PriceTableTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: true })
  name: string

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}