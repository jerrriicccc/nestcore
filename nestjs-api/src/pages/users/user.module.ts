import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { RolesModule } from '../roles/role.module';
import { RoleEntity } from '../roles/entity/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity]), RolesModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
