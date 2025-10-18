import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsInt, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  @IsOptional()
  expenseDate?: Date;

  @IsInt()
  @IsOptional()
  categoryId?: number;
}