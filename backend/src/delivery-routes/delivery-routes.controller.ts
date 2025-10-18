import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, ValidationPipe } from '@nestjs/common';
import { DeliveryRoutesService } from './delivery-routes.service';
import { CreateDeliveryRouteDto } from './dto/create-delivery-route.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { AssignOrdersDto } from './dto/assign-orders.dto';

@Controller('delivery-routes')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class DeliveryRoutesController {
  constructor(private readonly deliveryRoutesService: DeliveryRoutesService) {}

  @Post()
  create(@Body(ValidationPipe) createDeliveryRouteDto: CreateDeliveryRouteDto) {
    return this.deliveryRoutesService.create(createDeliveryRouteDto);
  }

  @Get()
  findAll() {
    return this.deliveryRoutesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.deliveryRoutesService.findOne(id);
  }

  @Post(':id/assign-orders')
  assignOrders(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) assignOrdersDto: AssignOrdersDto,
  ) {
    return this.deliveryRoutesService.assignOrders(id, assignOrdersDto);
  }
}