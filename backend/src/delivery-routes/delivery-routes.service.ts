import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { DeliveryRoute } from './entities/delivery-route.entity';
import { CreateDeliveryRouteDto } from './dto/create-delivery-route.dto';
import { Order } from '@/orders/entities/order.entity';
import { AssignOrdersDto } from './dto/assign-orders.dto';

@Injectable()
export class DeliveryRoutesService {
  constructor(
    @InjectRepository(DeliveryRoute)
    private readonly routeRepository: Repository<DeliveryRoute>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  create(createDeliveryRouteDto: CreateDeliveryRouteDto) {
    const route = this.routeRepository.create({
      ...createDeliveryRouteDto,
      routeDate: createDeliveryRouteDto.routeDate instanceof Date
        ? createDeliveryRouteDto.routeDate.toISOString()
        : createDeliveryRouteDto.routeDate,
      status: 'pending',
    });
    return this.routeRepository.save(route);
  }

  findAll() {
    return this.routeRepository.find({ order: { routeDate: 'DESC' } });
  }

  async findOne(id: string) {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: ['orders', 'orders.customer'],
    });
    if (!route) throw new NotFoundException(`Route with ID ${id} not found`);
    return route;
  }

  async assignOrders(id: string, assignOrdersDto: AssignOrdersDto) {
    const route = await this.routeRepository.findOneBy({ id });
    if (!route) throw new NotFoundException(`Route with ID ${id} not found`);
    
    const { orderIds } = assignOrdersDto;

    await this.orderRepository.update(
      { id: In(orderIds) },
      { deliveryRouteId: route.id }
    );
    
    return this.findOne(id);
  }
}