import { Module, forwardRef } from '@nestjs/common';
import { RoleAccessDetailsService } from './roleaccessdetail.service';
import { RoleAccessDetailsController } from './roleaccessdetail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAccessDetailEntity } from './entity/roleaccessdetail.entity';
import { RoleAccessTypesModule } from '../roleaccesstypes/roleaccesstype.module';
import { RoleAccessOptionsModule } from 'src/pages/roleaccessoptions/roleaccessoption.module';
import { RoleAccessOption } from 'src/pages/roleaccessoptions/entity/roleaccessoption.entity';
import { RoleAccessType } from 'src/pages/roleaccesstypes/entity/roleaccesstype.entity';
import { RoleLinesModule } from 'src/pages/rolelines/roleline.module';
import { RoleLine } from 'src/pages/rolelines/entity/roleline.entity';
import { Role } from 'src/pages/roles/entity/role.entity';
import { RolesModule } from 'src/pages/roles/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleAccessDetailEntity,
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
