import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class BaseDto {
  @IsNumber()
  @IsNotEmpty()
  roleid: number;

  @IsNumber()
  @IsOptional()
  grantypeid: number;

  @IsNumber()
  @IsNotEmpty()
  typeid: number;

  @IsString()
  @IsNotEmpty()
  accesskey?: string;

  @IsString()
  @IsNotEmpty()
  parentkey: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessvalue: string[];
}

export class CreateDto extends BaseDto {}

export class UpdateDto extends PartialType(BaseDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
