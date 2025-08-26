import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroomServiceEntity } from './entity/groomservice.entity';
import { GroomService } from './groomservice.service';
import { GroomServicesController } from './groomservice.controller';
import { AuthModule } from 'src/auth/auth.module';
import { CategoryTypeEntity } from '../categorytype/entity/categorytype.entity';
import { CategoryTypeModule } from '../categorytype/categorytype.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroomServiceEntity, CategoryTypeEntity]),
    AuthModule,
    CategoryTypeModule,
  ],
  controllers: [GroomServicesController],
  providers: [GroomService],
  exports: [GroomService, TypeOrmModule],
})
export class GroomServiceModule {}
