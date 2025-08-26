import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import * as argon2 from 'argon2';

import transformer from '../../component/Transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'role',
    type: 'varchar',
    transformer: transformer,
  })
  role: string[];

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  phonenumber: string;

  @Index()
  @Column({ default: 1 })
  statusid: number;

  @Column({ type: 'date', nullable: true })
  birthdate: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verificationtoken: string | null;

  @Column({ default: 0 })
  failedloginattempts: number;

  @Index()
  @Column()
  defaultroleid: number;

  private originalPassword: string;

  @AfterLoad()
  loadOriginalPassword() {
    this.originalPassword = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && this.password !== this.originalPassword) {
      this.password = await argon2.hash(this.password);
    }
  }
}
