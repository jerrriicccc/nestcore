import { Module } from '@nestjs/common';
import { RoleAccessTypesService } from './roleaccesstype.service';
import { RoleAccessTypesController } from './roleaccesstype.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAccessType } from './entity/roleaccesstype.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleAccessType])],
  providers: [RoleAccessTypesService],
  controllers: [RoleAccessTypesController],
  exports: [RoleAccessTypesService],
})
export class RoleAccessTypesModule {}
