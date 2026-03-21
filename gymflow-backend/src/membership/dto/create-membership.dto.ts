import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['Monthly', 'Quarterly', 'Yearly'])
  plan_type!: string;

  @IsDateString()
  @IsNotEmpty()
  start_date!: string;

  @IsDateString()
  @IsNotEmpty()
  end_date!: string;
}
