import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from "typeorm"
import { Token } from "./Token"
import { PriceTableDraft } from "./PriceTableDraft"
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

  @OneToMany(() => Token, token => token.user, { nullable: true, cascade: true })
  tokens: Token[]

  @OneToMany(() => PriceTableDraft, PriceTableDraft => PriceTableDraft.user, { nullable: true, cascade: true })
  priceTablesDraft: PriceTableDraft[]

  @OneToMany(() => PriceTable, PriceTable => PriceTable.user, { nullable: true, cascade: true })
  priceTables: PriceTable[]

  @OneToMany(() => PriceTableTemplate, template => template.user, { nullable: true, cascade: true })
  PriceTableTemplates: PriceTableTemplate[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}