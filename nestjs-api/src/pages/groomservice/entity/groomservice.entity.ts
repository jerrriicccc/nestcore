import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('groomservices')
export class GroomServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, default: '' })
  size: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  weight: string;

  @Column({ type: 'varchar', length: 150, default: '' })
  type: string;

  @Column({ type: 'mediumint', default: 0 })
  price: number;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  categorytypeid: number;
}
