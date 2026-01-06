// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   BeforeInsert,
//   BeforeUpdate,
//   Index,
// } from 'typeorm';

// import transformer from '../../../component/Transformer';

// @Entity('roleaccessdetails')
// export class RoleAccessDetailEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ type: 'varchar', length: 50, default: '' })
//   name: string;

//   @Index()
//   @Column({ type: 'int' })
//   typeid: number;

//   @Index()
//   @Column({ type: 'varchar', length: 50, default: '' })
//   accesskey: string;

//   @Column({
//     name: 'access',
//     type: 'varchar',
//     transformer: transformer,
//     length: 100,
//     default: '',
//   })
//   access: string[];

//   @Column({ type: 'varchar', length: 255, default: '' })
//   models: string;

//   @BeforeInsert()
//   @BeforeUpdate()
//   transformAccess() {
//     if (!this.access) {
//       this.access = [];
//     } else if (!Array.isArray(this.access)) {
//       console.warn('Access is not an array, converting to empty array');
//       this.access = [];
//     } else {
//       // Convert all values to strings, trim whitespace, and remove duplicates
//       this.access = [
//         ...new Set(this.access.map((value) => String(value).trim())),
//       ];
//     }
//     // Models is now a plain string, no transformation needed
//     if (!this.models) {
//       this.models = '';
//     }
//   }
// }

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

  @Column({ type: 'varchar', length: 50, default: '' })
  name: string;

  @Index()
  @Column({ type: 'int' })
  typeid: number;

  @Index()
  @Column({ type: 'varchar', length: 50, default: '' })
  accesskey: string;

  @Column({
    name: 'access',
    type: 'varchar',
    transformer: transformer,
    length: 100,
    default: '',
  })
  access: string[];

  @Column({
    name: 'models',
    type: 'varchar',
    transformer: transformer,
    length: 100,
    default: '',
  })
  models: string[];

  @BeforeInsert()
  @BeforeUpdate()
  transformAccess() {
    // Transform access field
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

    // Transform models field
    if (!this.models) {
      this.models = [];
    } else if (!Array.isArray(this.models)) {
      console.warn('Models is not an array, converting to empty array');
      this.models = [];
    } else {
      // Convert all values to strings, trim whitespace, and remove duplicates
      this.models = [
        ...new Set(this.models.map((value) => String(value).trim())),
      ];
    }
  }
}
