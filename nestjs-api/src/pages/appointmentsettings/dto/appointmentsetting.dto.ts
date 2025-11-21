import { PartialType } from '@nestjs/mapped-types';
import {
  IsRequiredString,
  IsRequiredNumber,
} from '../../../utils/validation.util';

export class BaseDto {
  @IsRequiredString()
  name: string;

  @IsRequiredString()
  type: string;

  @IsRequiredString()
  reference: string;

  @IsRequiredNumber()
  setting: number;
}

export class CreateDto extends BaseDto {}
export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;
}

export class AppointmentSettingResponseDto {
  id: number;
  name: string;
  type: string;
  reference: string;
  setting: number;
}
