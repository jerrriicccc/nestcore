import { Module, forwardRef } from '@nestjs/common';
import { RoleAccessDetailsService } from './roleaccessdetail.service';
import { RoleAccessDetailsController } from './roleaccessdetail.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleAccessDetailEntity } from './entity/roleaccessdetail.entity';
import { RoleAccessTypesModule } from '../roleaccesstypes/roleaccesstype.module';
import { RoleAccessOptionsModule } from 'src/pages/roleaccessoptions/roleaccessoption.module';
import { RoleAccessOptionEntity } from 'src/pages/roleaccessoptions/entity/roleaccessoption.entity';
import { RoleAccessTypeEntity } from 'src/pages/roleaccesstypes/entity/roleaccesstype.entity';
import { RoleLinesModule } from 'src/pages/rolelines/roleline.module';
import { RoleLineEntity } from 'src/pages/rolelines/entity/roleline.entity';
import { RoleEntity } from 'src/pages/roles/entity/role.entity';
import { RolesModule } from 'src/pages/roles/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleAccessDetailEntity,
      RoleAccessOptionEntity,
      RoleAccessTypeEntity,
      RoleLineEntity,
      RoleEntity,
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
