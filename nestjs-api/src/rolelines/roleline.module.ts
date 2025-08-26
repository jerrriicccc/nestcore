import { Module, forwardRef } from '@nestjs/common';
import { RoleLinesService } from './roleline.service';
import { RoleLinesController } from './roleline.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleLine } from './entity/roleline.entity';
import { RoleAccessDetail } from '../roleaccessdetails/entity/roleaccessdetail.entity';
import { RoleAccessDetailsModule } from 'src/roleaccessdetails/roleaccessdetail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleLine, RoleAccessDetail]),
    forwardRef(() => RoleAccessDetailsModule),
  ],
  providers: [RoleLinesService],
  controllers: [RoleLinesController],
  exports: [RoleLinesService, TypeOrmModule],
})
export class RoleLinesModule {}
