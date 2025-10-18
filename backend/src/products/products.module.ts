import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { PriceList } from '@/price-lists/entities/price-list.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Customer, PriceList])], // <-- Añadir Customer y PriceList
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}