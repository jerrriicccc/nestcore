import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';

import transformer from '../../../component/Transformer';

@Entity('roleaccessdetails')
export class RoleAccessDetailEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Index()
  @Column({ type: 'int' })
  typeid: number;

  @Index()
  @Column()
  accesskey: string;

  @Column({
    name: 'access',
    type: 'varchar',
    transformer: transformer,
    comment: 'JSON array of access identifiers',
  })
  access: string[];

  @Column({ nullable: true })
  models: string;

  @BeforeInsert()
  @BeforeUpdate()
  transformAccess() {
    if (!this.access) {
      this.access = [];
    } else if (!Array.isArray(this.access)) {
      console.warn('Access is not an array, converting to empty array');
      this.access = [];
    } else {
      // Convert all values to strings, trim whitespace, and remove duplicates
      this.access = [
        ...new Set(this.access.map((value) => String(value).trim())),
      ];
    }
  }
}
