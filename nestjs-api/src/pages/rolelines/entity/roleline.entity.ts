import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';
import Transformer from '../../../component/Transformer';

@Entity('rolelines')
@Index(['accesskey'])
@Index(['roleid'])
export class RoleLineEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'smallint', default: 0 })
  roleid: number;

  @Index()
  @Column({ type: 'tinyint', default: 0 })
  grantypeid: number;

  @Index()
  @Column({ type: 'tinyint', default: 0 })
  typeid: number;

  @Column({ type: 'varchar', default: '' })
  accesskey: string;

  @Column({ type: 'varchar', default: '' })
  parentkey: string;

  @Column({
    name: 'accessvalue',
    type: 'varchar',
    length: 500,
    transformer: Transformer,
  })
  accessvalue: string[];
}
