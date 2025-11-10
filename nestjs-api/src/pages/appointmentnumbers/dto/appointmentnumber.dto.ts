// import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
// import { PartialType } from '@nestjs/mapped-types';

// export class BaseDto {
//   @IsString()
//   @IsNotEmpty()
//   prefix: string;

//   @IsNumber()
//   @IsNotEmpty()
//   startseries: number;
// }

// export class CreateDto extends BaseDto {}

// export class UpdateDto extends PartialType(BaseDto) {
//   @IsNotEmpty()
//   id: number;

//   @IsNumber()
//   @IsNotEmpty()
//   @IsOptional()
//   nextid: number;
// }

import { PartialType } from '@nestjs/mapped-types';

import {
  IsRequiredString,
  IsRequiredNumber,
  IsOptionalNumber,
} from '../../../utils/validation.util';

export class BaseDto {
  @IsRequiredString()
  prefix: string;

  @IsRequiredNumber()
  startseries: number;
}

export class CreateDto extends BaseDto {}

export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;

  @IsOptionalNumber()
  nextid?: number;
}
