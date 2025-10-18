import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Customer } from '@/customers/entities/customer.entity';
import { PriceList } from '@/price-lists/entities/price-list.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(PriceList)
    private readonly priceListRepository: Repository<PriceList>,
  ) {}

  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.preload({ id, ...updateProductDto });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
  
  async findPublic(): Promise<any[]> {
    const finalList = await this.priceListRepository.findOneBy({ id: 1 }); // ID 1 = Consumidor Final
    const margin = finalList ? finalList.marginPercentage / 100 : 0.40;

    const products = await this.productRepository.find({ where: { isActive: true } });

    return products.map(product => ({
      ...product,
      price: product.cost * (1 + margin),
    }));
  }

  async findForCustomer(customerId: string): Promise<any[]> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: ['priceList'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const products = await this.productRepository.find({ where: { isActive: true }});
    
    let priceListToUse = customer.priceList;

    if (!priceListToUse) {
        priceListToUse = await this.priceListRepository.findOneBy({ id: 1 });
    }
    
    const margin = priceListToUse ? priceListToUse.marginPercentage / 100 : 0.40;

    return products.map(product => ({
      ...product,
      price: product.cost * (1 + margin),
    }));
  }
}