import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentWorkflowSettingEntity } from './entity/appointmentworkflowsetting.entity';
import { AppointmentWorkflowSettingService } from './appointmentworkflowsetting.service';
import { AppointmentWorkflowSettingController } from './appointmentworkflowsetting.controller';
import { AuthModule } from 'src/pages/auth/auth.module';
import { AppointmentStatusModule } from '../appointmentstatuses/appointmentstatus.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentWorkflowSettingEntity]),
    AuthModule,
    AppointmentStatusModule,
  ],
  controllers: [AppointmentWorkflowSettingController],
  providers: [AppointmentWorkflowSettingService],
  exports: [AppointmentWorkflowSettingService, TypeOrmModule],
})
export class AppointmentWorkflowSettingModule {}
