import { PartialType } from '@nestjs/mapped-types';
import {
  IsRequiredString,
  IsRequiredNumber,
} from '../../../utils/validation.util';

export class BaseDto {
  @IsRequiredString()
  status: string;
}

export class CreateDto extends BaseDto {}
export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;
}

export class AppointmentStatusResponseDto {
  id: number;
  status: string;
}
