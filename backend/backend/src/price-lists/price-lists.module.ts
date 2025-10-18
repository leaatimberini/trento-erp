import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PriceListsService } from './price-lists.service';
import { PriceListsController } from './price-lists.controller';
import { PriceList } from './entities/price-list.entity';
import { Product } from '@/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PriceList, Product])],
  controllers: [PriceListsController],
  providers: [PriceListsService],
})
export class PriceListsModule {}