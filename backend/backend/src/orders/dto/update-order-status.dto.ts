import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;

  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingCost?: number;
}