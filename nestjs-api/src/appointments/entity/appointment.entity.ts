import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 70, default: '' })
  apnnumber: string;

  @Column({ length: 70, default: '' })
  createdby: string;

  @Column({ type: 'date', default: () => "'0000-00-00'" })
  appointmentdate: Date;

  @Column({ type: 'date', default: () => "'0000-00-00'" })
  datecreated: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalamount: number;

  @Column({ type: 'smallint', default: 0 })
  quantity: number;
}
