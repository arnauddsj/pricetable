import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from "typeorm"
import { Product } from "./Product"

@Entity()
@Unique(['product', 'paymentTypeName', 'currency'])
export class Price {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @ManyToOne(() => Product, product => product.prices)
  product: Product

  @Column()
  paymentTypeName: string

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