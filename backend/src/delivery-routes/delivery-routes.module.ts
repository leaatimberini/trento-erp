import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryRoutesService } from './delivery-routes.service';
import { DeliveryRoutesController } from './delivery-routes.controller';
import { DeliveryRoute } from './entities/delivery-route.entity';
import { Order } from '@/orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryRoute, Order])],
  controllers: [DeliveryRoutesController],
  providers: [DeliveryRoutesService],
})
export class DeliveryRoutesModule {}