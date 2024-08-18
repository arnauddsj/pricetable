import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Token } from "./Token"
import { PriceTable } from "./PriceTable"
import { PriceTableTemplate } from "./PriceTableTemplate"

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  name: string

  @OneToMany(() => Token, token => token.user)
  tokens: Token[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @OneToMany(() => PriceTable, priceTable => priceTable.user)
  priceTables: PriceTable[]

  @OneToMany(() => PriceTableTemplate, template => template.user, { nullable: true })
  templates: PriceTableTemplate[]
}