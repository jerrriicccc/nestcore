import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RoleAccessDetail } from '../../roleaccessdetails/entity/roleaccessdetail.entity';

@Entity('roleaccesstypes')
export class RoleAccessType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
