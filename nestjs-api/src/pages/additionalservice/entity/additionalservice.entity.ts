import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('additionalservices')
export class AdditionalServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, default: '' })
  additionalservice: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  price: string;
}
