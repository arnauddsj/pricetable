import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn, Unique } from "typeorm"
import { User } from "./User"
import { PriceTableDraft } from "./PriceTableDraft"
import { PriceTableDataType } from "../types/priceTableData"

@Entity()
@Unique("UQ_DEFAULT_TEMPLATE", ["isDefault"])
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
  isPremium: boolean // Paid user only

  @Column({ default: false })
  isDefault: boolean // If Yes Default template for new PriceTablesDraft

  @Column("jsonb")
  PriceTableData: PriceTableDataType

  @OneToMany(() => PriceTableDraft, draft => draft.PriceTableTemplate)
  priceTableDrafts: PriceTableDraft // The origin of this template 

  @ManyToOne(() => User, user => user.PriceTableTemplates, { nullable: true })
  user: User | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}