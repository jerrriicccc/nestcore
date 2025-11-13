import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entity/customers.entity';
import { CustomersService } from './customer.service';
import { CustomersController } from './customer.controller';
import { UserStatusEntity } from '../userstatuses/entity/userstatuses.entity';
import { AuthModule } from 'src/pages/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, UserStatusEntity]), AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService, TypeOrmModule],
})
export class CustomersModule {}
