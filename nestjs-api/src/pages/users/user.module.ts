import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolesModule } from '../roles/role.module';
import { ValidateAccessService } from '../../component/validateaccess/ValidateAccessComponent';
import { RoleEntity } from '../roles/entity/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity]), RolesModule],
  providers: [UserService, ValidateAccessService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule, ValidateAccessService],
})
export class UserModule {}
