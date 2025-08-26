import { Module, forwardRef } from '@nestjs/common';
import { RoleAccessDetailsService } from './roleaccessdetail.service';
import { RoleAccessDetailsController } from './roleaccessdetail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAccessDetail } from './entity/roleaccessdetail.entity';
import { RoleAccessTypesModule } from '../roleaccesstypes/roleaccesstype.module';
import { RoleAccessOptionsModule } from 'src/roleaccessoptions/roleaccessoption.module';
import { RoleAccessOption } from '../roleaccessoptions/entity/roleaccessoption.entity';
import { RoleAccessType } from 'src/roleaccesstypes/entity/roleaccesstype.entity';
import { RoleLinesModule } from 'src/rolelines/roleline.module';
import { RoleLine } from 'src/rolelines/entity/roleline.entity';
import { Role } from '../roles/entity/role.entity';
import { RolesModule } from 'src/roles/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleAccessDetail,
      RoleAccessOption,
      RoleAccessType,
      RoleLine,
      Role,
    ]),
    RoleAccessTypesModule,
    RoleAccessOptionsModule,
    forwardRef(() => RoleLinesModule),
    forwardRef(() => RolesModule),
  ],
  providers: [RoleAccessDetailsService],
  controllers: [RoleAccessDetailsController],
  exports: [RoleAccessDetailsService, TypeOrmModule],
})
export class RoleAccessDetailsModule {}
