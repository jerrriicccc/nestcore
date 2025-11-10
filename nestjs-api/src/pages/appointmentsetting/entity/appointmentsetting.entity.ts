import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('appointmentsettings')
export class AppointmentSettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  name: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  type: string;

  @Column({ type: 'varchar', length: 50, default: '' })
  reference: string;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  setting: number;
}
