import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('daycareservices')
export class DaycareServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150, default: '' })
  size: string;

  @Column({ type: 'mediumint', default: 0 })
  threehrs: number;

  @Column({ type: 'mediumint', default: 0 })
  sixhrs: number;

  @Column({ type: 'mediumint', default: 0 })
  ninehrs: number;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  categorytypeid: number;
}
