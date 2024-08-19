import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, UpdateDateColumn, CreateDateColumn, JoinColumn } from "typeorm"
import { User } from "./User"
import { PriceTableDraft } from "./PriceTableDraft"
import { PriceTableDataType } from "../types/priceTableData"

@Entity()
export class PriceTable {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @ManyToOne(() => User, user => user.priceTables)
  user: User

  @Column("jsonb")
  PriceTableData: PriceTableDataType

  @Column("text", { nullable: true })
  htmlTemplate: string

  @Column("jsonb", { nullable: true })
  customCSS: Record<string, any>

  @OneToOne(() => PriceTableDraft, draft => draft.priceTable, { cascade: true })
  draft: PriceTableDraft

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}