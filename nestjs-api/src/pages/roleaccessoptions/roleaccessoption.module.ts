import { Module } from '@nestjs/common';
import { RoleAccessOptionsService } from './roleaccessoption.service';
import { RoleAccessOptionsController } from './roleaccessoption.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAccessOptionEntity } from './entity/roleaccessoption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleAccessOptionEntity])],
  providers: [RoleAccessOptionsService],
  controllers: [RoleAccessOptionsController],
  exports: [RoleAccessOptionsService],
})
export class RoleAccessOptionsModule {}
