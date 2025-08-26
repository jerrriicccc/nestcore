// import {
//   IsString,
//   IsNotEmpty,
//   IsDateString,
//   IsNumber,
//   IsOptional,
// } from 'class-validator';
// import { PartialType } from '@nestjs/mapped-types';

// export class BaseDto {
//   @IsString()
//   @IsNotEmpty()
//   apnnumber: string;

//   @IsDateString()
//   @IsNotEmpty()
//   date: string;

//   @IsString()
//   @IsNotEmpty()
//   petname: string;

//   @IsNumber()
//   @IsNotEmpty()
//   timeid: number;

//   @IsNumber()
//   @IsNotEmpty()
//   servicecategoryid: number;

//   @IsNumber()
//   @IsOptional()
//   additionalserviceid: number;

//   @IsNumber()
//   @IsOptional()
//   durationid: number;

//   @IsNumber()
//   @IsNotEmpty()
//   sizeid: number;

//   @IsNumber()
//   @IsOptional()
//   typeid: number;

//   @IsNumber()
//   @IsNotEmpty()
//   price: number;

//   @IsNumber()
//   @IsNotEmpty()
//   totalamount: number;
// }

// export class CreateDto extends BaseDto {}

// export class UpdateDto extends PartialType(BaseDto) {
//   @IsNumber()
//   @IsNotEmpty()
//   id: number;
// }

import { PartialType } from '@nestjs/mapped-types';
import {
  IsRequiredString,
  IsRequiredDate,
  IsRequiredNumber,
  IsOptionalNumber,
} from '../../utils/validation.util';

export class BaseDto {
  @IsRequiredString()
  apnnumber: string;

  @IsRequiredDate()
  date: string;

  @IsRequiredString()
  petname: string;

  @IsRequiredNumber()
  timeid: number;

  @IsRequiredNumber()
  servicecategoryid: number;

  @IsOptionalNumber()
  additionalserviceid: number;

  @IsOptionalNumber()
  durationid: number;

  @IsRequiredNumber()
  sizeid: number;

  @IsOptionalNumber()
  typeid: number;

  @IsRequiredNumber()
  price: number;

  @IsRequiredNumber()
  totalamount: number;
}

export class CreateDto extends BaseDto {}
export class UpdateDto extends PartialType(BaseDto) {
  @IsRequiredNumber()
  id: number;
}

// Response DTO for appointments with formatted dates
export class AppointmentResponseDto {
  id: number;
  apnnumber: string;
  createdby: string;
  appointmentdate: string | null;
  datecreated: string | null;
  totalamount: number;
  quantity: number;
}
