import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  member_id!: number;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsDateString()
  @IsNotEmpty()
  due_date!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PAID', 'UNPAID'])
  status!: string;

  @IsDateString()
  @IsOptional()
  paid_date?: string;
}
