import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentEntity } from './entity/appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AuthModule } from 'src/pages/auth/auth.module';

// ENTITY
import { AppointmentNumberEntity } from 'src/pages/appointmentnumbers/entity/appointmentnumber.entity';

// MODULE

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity, AppointmentNumberEntity]),
    AuthModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService, TypeOrmModule],
})
export class AppointmentModule {}
