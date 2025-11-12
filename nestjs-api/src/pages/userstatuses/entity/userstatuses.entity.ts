import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('userstatuses')
export class UserStatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  status: string;
}
