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

import transformer from '../../../component/Transformer';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  githubId: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  name: string | null;

  @Column({
    name: 'assignedroles',
    type: 'varchar',
    transformer: transformer,
  })
  assignedroles: string[];

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
