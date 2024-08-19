import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn, OneToMany, UpdateDateColumn, CreateDateColumn } from "typeorm"
import { PriceTable } from "./PriceTable"
import { Product } from "./Product"
import { PriceTableTemplate } from "./PriceTableTemplate"
import { FeatureGroup } from "./FeatureGroup"
import { User } from "./User"
import { PaymentType } from "../types/priceTableData"

@Entity()
export class PriceTableDraft {
  @PrimaryGeneratedColumn("uuid")
  id: string

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
  paymentTypes: PaymentType[]

  @Column("text")
  htmlTemplate: string

  @Column("jsonb")
  customCSS: Record<string, any>

  @OneToOne(() => PriceTable, priceTable => priceTable.draft)
  @JoinColumn()
  priceTable: PriceTable

  @OneToOne(() => PriceTableTemplate)
  @JoinColumn()
  PriceTableTemplate: PriceTableTemplate

  @ManyToOne(() => User, user => user.priceTablesDraft)
  user: User

  @OneToMany(() => Product, product => product.priceTableDraft)
  products: Product[]

  @OneToMany(() => FeatureGroup, featureGroup => featureGroup.priceTableDraft)
  featureGroups: FeatureGroup[]

  @UpdateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  createdAt: Date
} 