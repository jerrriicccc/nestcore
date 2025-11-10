import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('statuses')
export class StatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  status: string;
}
