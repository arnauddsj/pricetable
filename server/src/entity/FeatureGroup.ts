import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm"
import { PriceTable } from "./PriceTable"
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

  @ManyToOne(() => PriceTable, priceTable => priceTable.featureGroups)
  priceTable: PriceTable

  @OneToMany(() => Feature, feature => feature.group)
  features: Feature[]
}


