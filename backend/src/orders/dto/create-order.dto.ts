import { IsArray, IsNotEmpty, IsUUID, ValidateNested, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCustomerDto } from '@/customers/dto/create-customer.dto';

class OrderItemDto {
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  @IsOptional() // Hacemos customerId opcional
  customerId?: string;

  @IsOptional()
  @ValidateNested() // Validamos el objeto anidado
  @Type(() => CreateCustomerDto)
  newCustomer?: CreateCustomerDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}