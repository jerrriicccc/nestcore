import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('appointmentnumbers')
export class AppointmentNumberEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  prefix: string;

  @Column({ type: 'int', default: 0 })
  startseries: number;

  @Column({ type: 'int', default: 0 })
  nextid: number;
}
