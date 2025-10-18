import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Customer } from '@/customers/entities/customer.entity';
import { Product } from '@/products/entities/product.entity';
import { DataSource, IsNull } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { PriceList } from '@/price-lists/entities/price-list.entity';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const { customerId, newCustomer, items } = createOrderDto;

      if (!customerId && !newCustomer) {
        throw new BadRequestException('Either customerId or newCustomer must be provided.');
      }
      
      const customerRepo = transactionalEntityManager.getRepository(Customer);
      const productRepo = transactionalEntityManager.getRepository(Product);
      const orderRepo = transactionalEntityManager.getRepository(Order);
      const priceListRepo = transactionalEntityManager.getRepository(PriceList);

      let customer: Customer;

      if (customerId) {
        customer = await customerRepo.findOne({
            where: { id: customerId },
            relations: ['priceList'],
        });
        if (!customer) throw new NotFoundException(`Customer with ID ${customerId} not found`);
      } else {
        const defaultPriceList = await priceListRepo.findOneBy({ id: 1 }); // ID 1 = Consumidor Final
        customer = customerRepo.create({ ...newCustomer, priceList: defaultPriceList });
        await customerRepo.save(customer);
        customer.priceList = defaultPriceList;
      }
      
      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const itemDto of items) {
        const product = await productRepo.findOneBy({ id: itemDto.productId });
        if (!product) throw new NotFoundException(`Product with ID ${itemDto.productId} not found`);

        if (product.stockQuantity < itemDto.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}.`);
        }

        product.stockQuantity -= itemDto.quantity;
        await productRepo.save(product);
        
        let finalPrice: number;
        const priceList = customer.priceList || await priceListRepo.findOneBy({ id: 1 });
        
        if (priceList) {
          const margin = priceList.marginPercentage / 100;
          finalPrice = product.cost * (1 + margin);
        } else {
          // Fallback de seguridad si no hay ninguna lista de precios
          // (no debería ocurrir, ya que creamos una por defecto)
          finalPrice = product.cost * 1.40; // Margen del 40% por defecto
        }

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = itemDto.quantity;
        orderItem.pricePerUnit = finalPrice;
        orderItems.push(orderItem);

        totalAmount += finalPrice * itemDto.quantity;
      }

      const order = orderRepo.create({
        customer,
        items: orderItems,
        totalAmount,
        status: OrderStatus.PENDING,
      });

      return orderRepo.save(order);
    });
  }
  
  findAll() {
    const orderRepository = this.dataSource.getRepository(Order);
    return orderRepository.find({ 
      relations: ['customer', 'items', 'items.product'],
      order: { createdAt: 'DESC' } 
    });
  }
  
  async findOne(id: string): Promise<Order> {
    const orderRepository = this.dataSource.getRepository(Order);
    const order = await orderRepository.findOne({ 
        where: { id }, 
        relations: ['customer', 'items', 'items.product'] 
    });
    if (!order) {
        throw new NotFoundException(`Order with ID "${id}" not found.`);
    }
    return order;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const { status, shippingCost } = updateOrderStatusDto;
    
    const order = await this.findOne(id);
    
    // Si se provee un costo de envío, lo actualizamos y recalculamos el total
    if (shippingCost !== undefined && shippingCost !== null) {
        // Para evitar sumar el envío varias veces, primero lo restamos del total si ya existía
        const originalTotal = order.totalAmount - order.shippingCost;
        order.shippingCost = shippingCost;
        order.totalAmount = originalTotal + shippingCost;
    }

    order.status = status;
    return this.dataSource.getRepository(Order).save(order);
  }

  findUnassigned() {
    return this.dataSource.getRepository(Order).find({
      where: {
        status: OrderStatus.COMPLETED,
        deliveryRouteId: IsNull(),
      },
      relations: ['customer'],
    });
  }
}