import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { PriceTableDraft } from "./PriceTableDraft"
import { Feature } from "./Feature"

@Entity()
export class FeatureGroup {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column("text")
  description: string

  @Column({ nullable: true })
  imageUrl: string

  @ManyToOne(() => PriceTableDraft, priceTableDraft => priceTableDraft.featureGroups)
  priceTableDraft: PriceTableDraft

  @OneToMany(() => Feature, feature => feature.group)
  features: Feature[]
}


