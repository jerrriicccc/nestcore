import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entity/appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AuthModule } from 'src/auth/auth.module';

// ENTITY
import { TimeScheduleEntity } from 'src/timeschedule/entity/timeschedule.entity';
import { GroomServiceEntity } from 'src/groomservice/entity/groomservice.entity';
import { DaycareServiceEntity } from 'src/daycareservice/entity/daycareservice.entity';
import { PetEntryLineEntity } from 'src/petentrylines/entity/petentryline.entity';
import { AppointmentNumberEntity } from 'src/appointmentnumbers/entity/appointmentnumber.entity';

// MODULE
import { GroomServiceModule } from 'src/groomservice/groomservice.module';
import { CategoryTypeModule } from 'src/categorytype/categorytype.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      TimeScheduleEntity,
      GroomServiceEntity,
      DaycareServiceEntity,
      PetEntryLineEntity,
      AppointmentNumberEntity,
    ]),
    AuthModule,
    CategoryTypeModule,
    GroomServiceModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService, TypeOrmModule],
})
export class AppointmentModule {}
