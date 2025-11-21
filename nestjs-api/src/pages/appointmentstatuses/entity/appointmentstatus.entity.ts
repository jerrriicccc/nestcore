import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('appointmentstatuses')
export class AppointmentStatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  status: string;
}
