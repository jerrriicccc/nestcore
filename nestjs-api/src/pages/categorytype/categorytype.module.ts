import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryTypeEntity } from './entity/categorytype.entity';
import { CategoryTypeService } from './categorytype.service';
import { CategoryTypeController } from './categorytype.controller';
import { AuthModule } from 'src/pages/auth/auth.module';
@Module({
  imports: [TypeOrmModule.forFeature([CategoryTypeEntity]), AuthModule],
  controllers: [CategoryTypeController],
  providers: [CategoryTypeService],
  exports: [CategoryTypeService, TypeOrmModule],
})
export class CategoryTypeModule {}
