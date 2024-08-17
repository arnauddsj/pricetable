import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { FeatureGroup } from "./FeatureGroup"

@Entity()
export class Feature {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  name: string

  @Column("text")
  description: string

  @Column({ nullable: true })
  imageUrl: string

  @Column({ nullable: true })
  availableFeatureIconUrl: string

  @Column({ nullable: true })
  unavailableFeatureIconUrl: string

  @ManyToOne(() => FeatureGroup, group => group.features)
  group: FeatureGroup
}