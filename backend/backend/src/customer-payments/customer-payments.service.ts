import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerPayment } from './entities/customer-payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Order, OrderPaymentStatus, OrderStatus } from '@/orders/entities/order.entity';

@Injectable()
export class CustomerPaymentsService {
  constructor(
    @InjectRepository(CustomerPayment)
    private readonly paymentRepository: Repository<CustomerPayment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<CustomerPayment> {
    const payment = this.paymentRepository.create(createPaymentDto);
    await this.paymentRepository.save(payment);
    
    await this.updateOrderStatusForCustomer(payment.customerId);

    return payment;
  }

  private async updateOrderStatusForCustomer(customerId: string): Promise<void> {
    const { totalDebt } = await this.getAccountBalance(customerId);
    
    if (totalDebt <= 0) {
        await this.orderRepository.update(
            { customerId, paymentStatus: OrderPaymentStatus.UNPAID },
            { paymentStatus: OrderPaymentStatus.PAID }
        );
    }
  }

  async getAccountBalance(customerId: string): Promise<{ totalBilled: number, totalPaid: number, totalDebt: number }> {
    const { totalBilled } = await this.orderRepository.createQueryBuilder("order")
        .select("COALESCE(SUM(order.totalAmount), 0)", "totalBilled")
        .where("order.customerId = :customerId", { customerId })
        .andWhere("order.status = :status", { status: OrderStatus.COMPLETED })
        .getRawOne();
        
    const { totalPaid } = await this.paymentRepository.createQueryBuilder("payment")
        .select("COALESCE(SUM(payment.amount), 0)", "totalPaid")
        .where("payment.customerId = :customerId", { customerId })
        .getRawOne();
        
    const billed = parseFloat(totalBilled) || 0;
    const paid = parseFloat(totalPaid) || 0;
    
    return {
        totalBilled: billed,
        totalPaid: paid,
        totalDebt: billed - paid,
    };
  }
}