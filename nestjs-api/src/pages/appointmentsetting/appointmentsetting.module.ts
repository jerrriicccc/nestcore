import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentSettingEntity } from './entity/appointmentsetting.entity';
import { AppointmentSettingService } from './appointmentsetting.service';
import { AppointmentSettingsController } from './appointmentsetting.controller';
import { AuthModule } from 'src/pages/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppointmentSettingEntity]), AuthModule],
  controllers: [AppointmentSettingsController],
  providers: [AppointmentSettingService],
  exports: [AppointmentSettingService, TypeOrmModule],
})
export class AppointmentSettingModule {}
