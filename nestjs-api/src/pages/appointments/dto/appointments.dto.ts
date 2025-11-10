import { PartialType } from '@nestjs/mapped-types';
import {
  IsRequiredString,
  IsRequiredDate,
  IsRequiredNumber,
  IsOptionalNumber,
} from '../../../utils/validation.util';

export class BaseDto {
  // @IsRequiredString()
  // apnnumber: string;

  // @IsRequiredDate()
  // date: string;

  @IsRequiredString()
  lastname: string;

  @IsRequiredString()
  firstname: string;
}

export class CreateDto extends BaseDto {}
export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;
}

// Response DTO for appointments with formatted dates
export class AppointmentResponseDto {
  id: number;
  // apnnumber: string;
  lastname: string;
  firstname: string;
  // createdby: string;
  // datecreated: string | null;
}
