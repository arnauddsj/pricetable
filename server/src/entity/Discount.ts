import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm"
import { Product } from "./Product"

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