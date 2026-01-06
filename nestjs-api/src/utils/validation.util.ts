import { applyDecorators } from '@nestjs/common';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * String field - required
 */
export function IsRequiredString() {
  return applyDecorators(IsString(), IsNotEmpty());
}

/**
 * Date field - required, must be valid ISO date
 */
export function IsRequiredDate() {
  return applyDecorators(IsDateString(), IsNotEmpty());
}

/**
 * Number field - required (allows decimals)
 */
export function IsRequiredNumber() {
  return applyDecorators(IsNumber(), IsNotEmpty());
}

/**
 * Integer field - required (whole numbers only)
 */
export function IsRequiredInteger() {
  return applyDecorators(IsInt(), IsNotEmpty());
}

/**
 * Number field - optional (allows decimals)
 */
export function IsOptionalNumber() {
  return applyDecorators(IsNumber(), IsOptional());
}

/**
 * Integer field - optional (whole numbers only)
 */
export function IsOptionalInteger() {
  return applyDecorators(IsInt(), IsOptional());
}

/**
 * String field - optional
 */
export function IsOptionalString() {
  return applyDecorators(IsString(), IsOptional());
}

/**
 * Date field - optional, must be valid ISO date if provided
 */
export function IsOptionalDate() {
  return applyDecorators(IsDateString(), IsOptional());
}
