import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';

@Controller('purchase-orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  create(@Body(ValidationPipe) createPurchaseOrderDto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(createPurchaseOrderDto);
  }

  @Get()
  findAll() {
    return this.purchaseOrdersService.findAll();
  }
  
  @Post(':id/receive')
  receiveOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.purchaseOrdersService.receiveOrder(id);
  }
}