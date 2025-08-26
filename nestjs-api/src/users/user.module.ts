import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolesModule } from '../roles/role.module';
import { ValidateAccessService } from '../lib/validate-access.service';
import { Role } from '../roles/entity/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role]), RolesModule],
  providers: [UserService, ValidateAccessService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule, ValidateAccessService],
})
export class UserModule {}
