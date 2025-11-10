import { IsString, IsNotEmpty, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class BaseDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class CreateDto extends BaseDto {}

export class UpdateDto extends PartialType(BaseDto) {
  @IsNumber()
  id: number;
}
