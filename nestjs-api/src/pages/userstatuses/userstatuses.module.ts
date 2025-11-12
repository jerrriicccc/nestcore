import { Module } from '@nestjs/common';
import { UserStatusesService } from './userstatuses.service';
import { UserStatusesController } from './userstatuses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserStatusEntity } from './entity/userstatuses.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserStatusEntity])],
  providers: [UserStatusesService],
  controllers: [UserStatusesController],
  exports: [UserStatusesService],
})
export class UserStatusesModule {}
