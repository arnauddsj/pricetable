import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable } from "typeorm"
import { PriceTable } from "./PriceTable"
import { PriceTableDraft } from "./PriceTableDraft"
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
  buttonLink: string

  @Column({ nullable: true })
  stripeProductId: string

  @Column({ nullable: true })
  paddleProductId: string

  @ManyToOne(() => PriceTable, priceTable => priceTable.products)
  priceTable: PriceTable

  @ManyToOne(() => PriceTableDraft, priceTableDraft => priceTableDraft.products)
  priceTableDraft: PriceTableDraft

  @OneToMany(() => Price, price => price.product)
  prices: Price[]

  @ManyToMany(() => Feature)
  @JoinTable()
  features: Feature[]
}