import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import transformArray from '../../../component/Transformer';

@Entity('appointmentworkflowsettings')
export class AppointmentWorkflowSettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int', default: 0 })
  statusid: number;

  @Column({ type: 'int', default: 0 })
  ordernumber: number;

  @Column({
    name: 'linkedstatuses',
    type: 'varchar',
    transformer: transformArray,
  })
  linkedstatuses: string[];

  @Column({ type: 'varchar', length: 255, default: '' })
  linkedfunction: string;
}
