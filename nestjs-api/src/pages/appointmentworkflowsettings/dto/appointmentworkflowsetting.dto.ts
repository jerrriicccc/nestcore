import { PartialType } from '@nestjs/mapped-types';

import {
  IsRequiredNumber,
  IsOptionalString,
} from '../../../utils/validation.util';

import { IsString, IsOptional, IsArray } from 'class-validator';

export class BaseDto {
  @IsRequiredNumber()
  statusid: number;

  @IsRequiredNumber()
  ordernumber: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedstatuses: string[];

  @IsOptionalString()
  linkedfunction: string;
}

export class CreateDto extends BaseDto {}

export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;
}
