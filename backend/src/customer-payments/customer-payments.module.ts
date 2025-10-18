import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerPaymentsService } from './customer-payments.service';
import { CustomerPaymentsController } from './customer-payments.controller';
import { CustomerPayment } from './entities/customer-payment.entity';
import { Order } from '@/orders/entities/order.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerPayment, Order])
  ],
  controllers: [CustomerPaymentsController],
  providers: [CustomerPaymentsService],
  exports: [CustomerPaymentsService],
})
export class CustomerPaymentsModule {}