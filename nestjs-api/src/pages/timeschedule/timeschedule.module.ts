import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeScheduleEntity } from './entity/timeschedule.entity';
import { TimeScheduleService } from './timeschedule.service';
import { TimeSchedulesController } from './timeschedule.controller';
import { AuthModule } from 'src/pages/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TimeScheduleEntity]), AuthModule],
  controllers: [TimeSchedulesController],
  providers: [TimeScheduleService],
  exports: [TimeScheduleService, TypeOrmModule],
})
export class TimeScheduleModule {}
