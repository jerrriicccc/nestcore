import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class BaseDto {
  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsNumber()
  @IsNotEmpty()
  statusid: number;

  // Add any other common fields here if needed, e.g., email, phone, etc.
}

export class CreateDto extends BaseDto {
  // Add create-specific fields if needed
}

export class UpdateDto extends PartialType(BaseDto) {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  // Optional: Include additional update-only fields
}
