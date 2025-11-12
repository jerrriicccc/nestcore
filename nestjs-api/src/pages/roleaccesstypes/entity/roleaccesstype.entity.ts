import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { RoleAccessDetailEntity } from '../../roleaccessdetails/entity/roleaccessdetail.entity';

@Entity('roleaccesstypes')
export class RoleAccessTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}
