import { PartialType } from '@nestjs/mapped-types';
import {
  IsRequiredString,
  IsRequiredDate,
  IsRequiredNumber,
  IsOptionalNumber,
  IsOptionalString,
} from '../../../utils/validation.util';

export class BaseDto {
  @IsRequiredString()
  lastname: string;

  @IsRequiredString()
  firstname: string;
}

export class CreateDto extends BaseDto {}
export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;

  // Allow createdby in DTO but it will be ignored during update
  // This field is set by the backend and shouldn't be updated by users
  @IsOptionalString()
  createdby?: string;
}

// Response DTO for appointments with formatted dates
export class AppointmentResponseDto {
  id: number;
  lastname: string;
  firstname: string;
}
