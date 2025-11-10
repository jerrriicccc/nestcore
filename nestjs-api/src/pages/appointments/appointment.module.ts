import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entity/appointment.entity';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { AuthModule } from 'src/pages/auth/auth.module';

// ENTITY
import { TimeScheduleEntity } from 'src/pages/timeschedule/entity/timeschedule.entity';
import { GroomServiceEntity } from 'src/pages/groomservice/entity/groomservice.entity';
import { DaycareServiceEntity } from 'src/pages/daycareservice/entity/daycareservice.entity';
import { PetEntryLineEntity } from 'src/pages/petentrylines/entity/petentryline.entity';
import { AppointmentNumberEntity } from 'src/pages/appointmentnumbers/entity/appointmentnumber.entity';

// MODULE
import { GroomServiceModule } from 'src/pages/groomservice/groomservice.module';
import { CategoryTypeModule } from 'src/pages/categorytype/categorytype.module';

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
