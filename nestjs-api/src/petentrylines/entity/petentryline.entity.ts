import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('petentrylines')
export class PetEntryLineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 70, default: '' })
  apnnumber: string;

  @Column({ length: 50, default: '' })
  petname: string;

  @Column({ type: 'date', default: () => "'0000-00-00'" })
  date: Date;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  timeid: number;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  servicecategoryid: number;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  additionalserviceid: number;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  durationid: number;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  sizeid: number;

  @Index()
  @Column({ type: 'smallint', default: 0 })
  typeid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
