import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  ArrayUnique,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class BaseDto {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  typeid: number;

  @IsString()
  @IsNotEmpty()
  accesskey: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  access: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  models?: string[];
}

export class CreateDto extends BaseDto {}

export class UpdateDto extends PartialType(BaseDto) {
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
