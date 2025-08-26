import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

import { PetEntryLineEntity } from './entity/petentryline.entity';
import { PetEntryLineService } from './petentryline.service';
import { PetEntryLineController } from './petentryline.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PetEntryLineEntity]), AuthModule],
  controllers: [PetEntryLineController],
  providers: [PetEntryLineService],
  exports: [PetEntryLineService, TypeOrmModule],
})
export class PetEntryLineModule {}
