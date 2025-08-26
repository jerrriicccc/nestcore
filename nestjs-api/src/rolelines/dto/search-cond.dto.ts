import { IsOptional, IsNumber, IsString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchCondDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  roleid?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  typeid?: number | number[];

  @IsOptional()
  @IsString()
  parentkey?: string;
}
