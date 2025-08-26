import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentNumberEntity } from './entity/appointmentnumber.entity';
import { AppointmentNumberService } from './appointmentnumber.service';
import { AppointmentNumberController } from './appointmentnumber.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentNumberEntity]), AuthModule],
  controllers: [AppointmentNumberController],
  providers: [AppointmentNumberService],
  exports: [AppointmentNumberService, TypeOrmModule],
})
export class AppointmentNumberModule {}
