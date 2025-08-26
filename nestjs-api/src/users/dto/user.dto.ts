import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  Matches,
  IsPhoneNumber,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class BaseUserDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  role: string[];

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(255, { message: 'Email is too long' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password is too long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @IsPhoneNumber('PH', { message: 'Please provide a valid phone number' })
  phonenumber: string;

  @IsOptional()
  @IsDateString({}, { message: 'Please provide a valid date' })
  birthdate?: string;

  @IsNumber({}, { message: 'Default role ID must be a number' })
  defaultroleid: number;
}

export class CreateDto extends BaseUserDto {}

export class UpdateDto extends PartialType(BaseUserDto) {
  @IsNumber({}, { message: 'ID must be a number' })
  id: number;
}
