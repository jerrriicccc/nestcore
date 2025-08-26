import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class BaseDto {
  @IsString()
  @IsNotEmpty()
  petname: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @IsNotEmpty()
  timeid: number;

  @IsNumber()
  @IsNotEmpty()
  servicecategoryid: number;

  @IsNumber()
  @IsOptional()
  additionalserviceid: number;

  @IsNumber()
  @IsOptional()
  durationid: number;

  @IsNumber()
  @IsNotEmpty()
  sizeid: number;

  @IsNumber()
  @IsOptional()
  typeid: number;

  @IsNumber()
  @IsNotEmpty()
  price: number;
}

export class CreateDtoPetEntryLine extends BaseDto {}

export class UpdateDto extends PartialType(BaseDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
