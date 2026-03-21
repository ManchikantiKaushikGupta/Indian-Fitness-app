import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsNumber()
  @IsOptional()
  gym_id?: number = 1; // Defaulting to 1 for MVP
}
