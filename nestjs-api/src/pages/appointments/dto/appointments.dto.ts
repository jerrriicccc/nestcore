import { PartialType, OmitType } from '@nestjs/mapped-types';
import {
  IsRequiredString,
  IsRequiredDate,
  IsRequiredNumber,
  IsOptionalDate,
} from '../../../utils/validation.util';

export class BaseDto {
  @IsRequiredString()
  lastname: string;

  @IsRequiredString()
  firstname: string;

  @IsOptionalDate()
  datecreated?: string;
}

export class CreateDto extends BaseDto {}
export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;
}

// Response DTO for appointments with formatted dates
export class AppointmentResponseDto {
  id: number;
  lastname: string;
  firstname: string;
}
