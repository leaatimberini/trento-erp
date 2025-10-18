import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  @IsOptional()
  paymentDate?: Date;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}