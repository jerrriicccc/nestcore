import { IsNumber, IsOptional } from 'class-validator';

// export class BaseDto {
//   //   @IsRequiredString()
//   //   lastname: string;
//   //   @IsRequiredString()
//   //   firstname: string;
//   //   @IsOptionalDate()
//   //   datecreated?: string;
// }

// export class CreateDto extends BaseDto {}
export class UpdateDto {
  @IsNumber({}, { message: 'ID must be a number' })
  id: number;

  @IsOptional()
  @IsNumber({}, { message: 'Default role ID must be a number' })
  defaultroleid?: number;

  @IsOptional()
  assignedroles?: string[];
}

// Response DTO for account card
export class AccountCardResponseDto {
  id: string;
  assignedroles: string[];
  defaultroleid: string;
}

export class AccountCardApiResponseDto {
  data: AccountCardResponseDto;
  meta: any[];
  message: string;
}
