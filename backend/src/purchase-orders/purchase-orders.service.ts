import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PurchaseOrder, PurchaseOrderStatus } from './entities/purchase-order.entity';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { Product } from '@/products/entities/product.entity';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createPurchaseOrderDto: CreatePurchaseOrderDto) {
    const { supplierId, items, ...rest } = createPurchaseOrderDto;
    const order = this.purchaseOrderRepository.create({
      ...rest,
      supplier: { id: supplierId },
      items: items.map(item => ({
        product: { id: item.productId },
        quantity: item.quantity,
        costPerUnit: item.costPerUnit,
      })),
    });
    return this.purchaseOrderRepository.save(order);
  }

  findAll() {
    return this.purchaseOrderRepository.find({ relations: ['supplier', 'items', 'items.product'] });
  }

  async receiveOrder(id: string) {
    return this.dataSource.transaction(async manager => {
      const order = await manager.findOne(PurchaseOrder, {
        where: { id },
        relations: ['items', 'items.product'],
      });

      if (!order) throw new NotFoundException(`Purchase Order with ID ${id} not found`);
      if (order.status === PurchaseOrderStatus.FULLY_RECEIVED) return { message: 'Order already received.' };

      for (const item of order.items) {
        const product = item.product;
        
        // --- INICIO DE LA NUEVA LÓGICA DE COSTO PROMEDIO ---
        const oldStock = product.stockQuantity;
        const oldCost = product.cost;
        const newStock = item.quantity;
        const newCost = item.costPerUnit;

        const totalOldValue = oldStock * oldCost;
        const totalNewValue = newStock * newCost;
        const totalStock = oldStock + newStock;
        
        // Evitar división por cero si el stock era 0
        const newAverageCost = totalStock > 0 ? (totalOldValue + totalNewValue) / totalStock : newCost;

        // Actualizamos el producto con el nuevo stock y el nuevo costo promedio
        product.stockQuantity += newStock;
        product.cost = newAverageCost;

        await manager.save(Product, product);
        // --- FIN DE LA NUEVA LÓGICA ---
      }

      order.status = PurchaseOrderStatus.FULLY_RECEIVED;
      return manager.save(order);
    });
  }
}