import { Module } from '@nestjs/common';
import { RoleAccessTypesService } from './roleaccesstype.service';
import { RoleAccessTypesController } from './roleaccesstype.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAccessTypeEntity } from './entity/roleaccesstype.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleAccessTypeEntity])],
  providers: [RoleAccessTypesService],
  controllers: [RoleAccessTypesController],
  exports: [RoleAccessTypesService],
})
export class RoleAccessTypesModule {}
