import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entity/customers.entity';
import { CustomersService } from './customer.service';
import { CustomersController } from './customer.controller';
import { UserStatus } from '../userstatuses/entity/userstatuses.entity';
import { ValidateAccessService } from '../../component/validateaccess/ValidateAccessComponent';
import { AuthModule } from 'src/pages/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, UserStatus]), AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService, ValidateAccessService],
  exports: [CustomersService, TypeOrmModule, ValidateAccessService],
})
export class CustomersModule {}
