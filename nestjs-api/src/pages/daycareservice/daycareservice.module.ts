import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DaycareServiceEntity } from './entity/daycareservice.entity';
import { DaycareService } from './daycareservice.service';
import { DaycareServicesController } from './daycareservice.controller';
import { AuthModule } from 'src/pages/auth/auth.module';
import { CategoryTypeEntity } from 'src/pages/categorytype/entity/categorytype.entity';
import { CategoryTypeModule } from 'src/pages/categorytype/categorytype.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DaycareServiceEntity, CategoryTypeEntity]),
    AuthModule,
    CategoryTypeModule,
  ],
  controllers: [DaycareServicesController],
  providers: [DaycareService],
  exports: [DaycareService, TypeOrmModule],
})
export class DaycareServiceModule {}
