import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
export class SetProductPriceDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(0)
  price: number;
}