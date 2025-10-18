import { Controller, Post, Body, ParseUUIDPipe, Query, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';

class CreatePreferenceDto {
    orderId: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  create(@Body('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentsService.createPreference(orderId);
  }

  // --- NUEVO ENDPOINT PARA WEBHOOKS ---
  @Post('webhook')
  @HttpCode(200) // Respondemos 200 OK para que Mercado Pago sepa que recibimos la notificación
  handleWebhook(@Body() body: any, @Query() query: any) {
    // Mercado Pago envía notificaciones de dos tipos, nos interesa el de 'payment'
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      return this.paymentsService.handlePaymentNotification(paymentId);
    }
    return;
  }
}