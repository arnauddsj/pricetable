import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, UpdateDateColumn, CreateDateColumn } from "typeorm"
import { User } from "./User"
import { PriceTableDraft } from "./PriceTableDraft"
import { PriceTableData } from "../types/priceTableData"

@Entity()
export class PriceTableTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ nullable: true })
  name: string

  @Column("jsonb")
  versions: PriceTableData[]

  @Column({ default: false })
  isPublic: boolean // If true, the template is available to all users, it's like isPublished

  @Column({ default: false })
  isFeatured: boolean

  @Column({ default: false })
  isPremium: boolean

  @Column()
  version: string

  @Column("jsonb")
  customCSS: Record<string, any>

  @OneToMany(() => PriceTableDraft, draft => draft.PriceTableTemplate)
  priceTableDrafts: PriceTableDraft[]

  @ManyToOne(() => User, user => user.PriceTableTemplates, { nullable: true })
  user: User | null

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}