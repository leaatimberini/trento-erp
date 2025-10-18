import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from '@/orders/entities/order.entity';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private readonly client: MercadoPagoConfig;
  private readonly frontendUrl: string;

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService,
  ) {
    this.client = new MercadoPagoConfig({ 
        accessToken: this.configService.get('MERCADOPAGO_ACCESS_TOKEN') 
    });
    this.frontendUrl = this.configService.get('FRONTEND_URL');
  }

  async createPreference(orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, status: OrderStatus.PENDING },
      relations: ['items', 'items.product', 'customer'],
    });

    if (!order) {
      throw new NotFoundException(`Pending order with ID ${orderId} not found.`);
    }

    const preferenceItems = order.items.map(item => ({
      id: item.product.id,
      title: item.product.name,
      quantity: item.quantity,
      unit_price: Number(item.pricePerUnit),
      currency_id: 'ARS',
    }));
    
    const preference = new Preference(this.client);
    
    const result = await preference.create({
      body: {
        items: preferenceItems,
        payer: { name: order.customer.firstName, surname: order.customer.lastName, email: order.customer.email },
        back_urls: {
          success: `${this.frontendUrl}/checkout/success`,
          failure: `${this.frontendUrl}/checkout/failure`,
          pending: `${this.frontendUrl}/checkout/pending`,
        },
        auto_return: 'approved',
        external_reference: order.id,
        notification_url: 'URL_PUBLICA_DE_TU_WEBHOOK', // Se configura en el panel de MP, pero se puede sobreescribir aquí
      },
    });

    return { preferenceId: result.id, init_point: result.init_point };
  }

  // --- NUEVO MÉTODO PARA MANEJAR NOTIFICACIONES ---
  async handlePaymentNotification(paymentId: string) {
    try {
      const paymentSvc = new Payment(this.client);
      const payment = await paymentSvc.get({ id: paymentId });

      if (payment && payment.external_reference) {
        const orderId = payment.external_reference;
        const order = await this.orderRepository.findOneBy({ id: orderId });

        if (order) {
          if (payment.status === 'approved' && order.status === OrderStatus.PENDING) {
            order.status = OrderStatus.COMPLETED;
            await this.orderRepository.save(order);
            console.log(`Order ${orderId} successfully updated to COMPLETED.`);
          }
          // Aquí se podrían manejar otros estados como 'rejected', etc.
        }
      }
    } catch (error) {
      console.error('Error handling webhook notification:', error);
      throw new InternalServerErrorException('Error handling webhook notification');
    }
  }
}