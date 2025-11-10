import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class BaseDto {
  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsOptional()
  weight: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @IsNotEmpty()
  categorytypeid: number;
}

export class CreateDto extends BaseDto {}

export class UpdateDto extends PartialType(BaseDto) {
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  id: number;
}
