import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdditionalServiceEntity } from './entity/additionalservice.entity';
import { AdditionalService } from './additionalservice.service';
import { AdditionalServicesController } from './additionalservice.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AdditionalServiceEntity]), AuthModule],
  controllers: [AdditionalServicesController],
  providers: [AdditionalService],
  exports: [AdditionalService, TypeOrmModule],
})
export class AdditionalServiceModule {}
