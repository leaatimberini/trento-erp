import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, IsUUID, Min, ValidateNested, IsOptional, IsDateString } from 'class-validator';

class PurchaseOrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  costPerUnit: number;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  @IsNotEmpty()
  supplierId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}