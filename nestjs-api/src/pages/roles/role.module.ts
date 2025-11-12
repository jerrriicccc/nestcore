import { Module } from '@nestjs/common';
import { RolesService } from './role.service';
import { RolesController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entity/role.entity';
import { RoleAccessDetailsModule } from 'src/pages/roleaccessdetails/roleaccessdetail.module';
import { RoleAccessDetailEntity } from '../roleaccessdetails/entity/roleaccessdetail.entity';
import { RoleLineEntity } from '../rolelines/entity/roleline.entity';
import { RoleLinesModule } from '../rolelines/roleline.module';
import { Customer } from '../customers/entity/customers.entity';
import { CustomersModule } from '../customers/customer.module';
import { ValidateAccessService } from '../../component/validateaccess/ValidateAccessComponent';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      RoleAccessDetailEntity,
      RoleLineEntity,
      Customer,
    ]),
    RoleAccessDetailsModule,
    RoleLinesModule,
    CustomersModule,
  ],
  providers: [RolesService, ValidateAccessService],
  controllers: [RolesController],
  exports: [RolesService, TypeOrmModule, ValidateAccessService],
})
export class RolesModule {}
