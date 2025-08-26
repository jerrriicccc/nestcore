import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categorytypes')
export class CategoryTypeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  servicetype: string;
}
