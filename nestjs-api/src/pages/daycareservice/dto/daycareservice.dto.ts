import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class BaseDto {
  @IsString()
  @IsNotEmpty()
  size: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  threehrs: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  sixhrs: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  ninehrs: number;

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
