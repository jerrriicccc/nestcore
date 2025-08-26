import { Module } from '@nestjs/common';
import { UserStatusesService } from './userstatuses.service';
import { UserStatusesController } from './userstatuses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStatus } from './entity/userstatuses.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserStatus])],
  providers: [UserStatusesService],
  controllers: [UserStatusesController],
  exports: [UserStatusesService],
})
export class UserStatusesModule {}
