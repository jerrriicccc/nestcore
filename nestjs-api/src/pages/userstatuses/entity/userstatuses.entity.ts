import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entity/user.entity';

@Entity('userstatuses')
export class UserStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  status: string;
}
