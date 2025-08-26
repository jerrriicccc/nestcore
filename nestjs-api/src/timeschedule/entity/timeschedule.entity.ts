import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('timeschedules')
export class TimeScheduleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  timeschedule: string;
}
