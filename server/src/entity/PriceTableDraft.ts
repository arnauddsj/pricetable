import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, UpdateDateColumn } from "typeorm"
import { PriceTable } from "./PriceTable"
import { Product } from "./Product"

@Entity()
export class PriceTableDraft {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @OneToOne(() => PriceTable, priceTable => priceTable.draft)
  @JoinColumn()
  priceTable: PriceTable

  @Column()
  name: string

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

  @OneToMany(() => Product, product => product.priceTableDraft)
  products: Product[]

  @UpdateDateColumn()
  updatedAt: Date
}