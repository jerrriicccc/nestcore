import { Module, forwardRef } from '@nestjs/common';
import { RoleLinesService } from './roleline.service';
import { RoleLinesController } from './roleline.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleLineEntity } from './entity/roleline.entity';
import { RoleAccessDetailEntity } from '../roleaccessdetails/entity/roleaccessdetail.entity';
import { RoleAccessDetailsModule } from 'src/pages/roleaccessdetails/roleaccessdetail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleLineEntity, RoleAccessDetailEntity]),
    forwardRef(() => RoleAccessDetailsModule),
  ],
  providers: [RoleLinesService],
  controllers: [RoleLinesController],
  exports: [RoleLinesService, TypeOrmModule],
})
export class RoleLinesModule {}
