import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, Unique } from "typeorm"
import { PriceTable } from "./PriceTable"
import { Price } from "./Price"
import { Feature } from "./Feature"

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

  @Column({ nullable: true })
  buttonText: string

  @Column({ nullable: true })
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
