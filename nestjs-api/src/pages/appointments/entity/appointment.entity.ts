import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('appointments')
export class AppointmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 70, default: '' })
  lastname: string;

  @Column({ length: 70, default: '' })
  firstname: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  datecreated: Date;
}
