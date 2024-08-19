import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, ManyToMany, JoinTable, UpdateDateColumn, CreateDateColumn } from "typeorm"
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

  @ManyToOne(() => PriceTableDraft, priceTableDraft => priceTableDraft.products)
  priceTableDraft: PriceTableDraft

  @OneToMany(() => Price, price => price.product)
  prices: Price[]

  @ManyToMany(() => Feature)
  @JoinTable()
  features: Feature[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}