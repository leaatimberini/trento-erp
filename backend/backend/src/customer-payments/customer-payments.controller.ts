import { Controller, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { CustomerPaymentsService } from './customer-payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';

@Controller('customer-payments')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class CustomerPaymentsController {
  constructor(private readonly customerPaymentsService: CustomerPaymentsService) {}

  @Post()
  create(@Body(ValidationPipe) createPaymentDto: CreatePaymentDto) {
    return this.customerPaymentsService.create(createPaymentDto);
  }
}