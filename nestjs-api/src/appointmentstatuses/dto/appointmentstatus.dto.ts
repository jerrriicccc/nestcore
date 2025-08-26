// import { IsString, IsNotEmpty } from 'class-validator';
// import { PartialType } from '@nestjs/mapped-types';

// export class BaseDto {
//   @IsString()
//   @IsNotEmpty()
//   status: string;
// }

// export class CreateDto extends BaseDto {}

// export class UpdateDto extends PartialType(BaseDto) {
//   @IsNotEmpty()
//   id: number;
// }

import { PartialType } from '@nestjs/mapped-types';
import {
  IsRequiredString,
  IsRequiredNumber,
} from '../../utils/validation.util';

export class BaseDto {
  @IsRequiredString()
  status: string;
}

export class CreateDto extends BaseDto {}
export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;
}

export class AppointmentSettingResponseDto {
  id: number;
  status: string;
}
