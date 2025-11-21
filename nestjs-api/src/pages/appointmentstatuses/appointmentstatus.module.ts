import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentStatusEntity } from './entity/appointmentstatus.entity';
import { AppointmentStatusService } from './appointmentstatus.service';
import { AppointmentStatusesController } from './appointmentstatus.controller';
import { AuthModule } from 'src/pages/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentStatusEntity]), AuthModule],
  controllers: [AppointmentStatusesController],
  providers: [AppointmentStatusService],
  exports: [AppointmentStatusService, TypeOrmModule],
})
export class AppointmentStatusModule {}
