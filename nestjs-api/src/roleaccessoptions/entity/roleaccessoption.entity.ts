import { RoleAccessDetail } from 'src/roleaccessdetails/entity/roleaccessdetail.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
} from 'typeorm';

@Entity('roleaccessoptions')
export class RoleAccessOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
