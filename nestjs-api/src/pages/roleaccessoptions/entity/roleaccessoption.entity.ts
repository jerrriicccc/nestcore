import { RoleAccessDetailEntity } from 'src/pages/roleaccessdetails/entity/roleaccessdetail.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';

@Entity('roleaccessoptions')
export class RoleAccessOptionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, default: '' })
  name: string;
}
