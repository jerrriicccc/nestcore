import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('appointments')
export class AppointmentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // @Index()
  // @Column({ type: 'varchar', length: 70, default: '' })
  // apnnumber: string;

  @Column({ length: 70, default: '' })
  createdby: string;

  @Column({ length: 70, default: '' })
  lastname: string;

  @Column({ length: 70, default: '' })
  firstname: string;

  // @Column({ type: 'date', default: () => "'0000-00-00'" })
  // datecreated: Date;
}
