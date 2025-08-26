import { Module } from '@nestjs/common';
import { RoleAccessOptionsService } from './roleaccessoption.service';
import { RoleAccessOptionsController } from './roleaccessoption.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAccessOption } from './entity/roleaccessoption.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleAccessOption])],
  providers: [RoleAccessOptionsService],
  controllers: [RoleAccessOptionsController],
  exports: [RoleAccessOptionsService],
})
export class RoleAccessOptionsModule {}
