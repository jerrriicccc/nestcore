import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entity/customers.entity';
import { CustomersService } from './customer.service';
import { CustomersController } from './customer.controller';
import { UserStatus } from '../userstatuses/entity/userstatuses.entity';
import { ValidateAccessService } from '../lib/validate-access.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, UserStatus]), AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService, ValidateAccessService],
  exports: [CustomersService, TypeOrmModule, ValidateAccessService],
})
export class CustomersModule {}
