import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusEntity } from './entity/appointmentstatus.entity';
import { StatusService } from './appointmentstatus.service';
import { StatusesController } from './appointmentstatus.controller';
import { AuthModule } from 'src/pages/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([StatusEntity]), AuthModule],
  controllers: [StatusesController],
  providers: [StatusService],
  exports: [StatusService, TypeOrmModule],
})
export class StatusModule {}
