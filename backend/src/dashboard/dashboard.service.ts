import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { Order, OrderStatus } from '@/orders/entities/order.entity';
import { Expense } from '@/expenses/entities/expense.entity';
import { Product } from '@/products/entities/product.entity';
import { OrderItem } from '@/orders/entities/order-item.entity';
import { CommercialEventDto } from './dto/commercial-event.dto';

const commercialEvents: Omit<CommercialEventDto, 'date'>[] = [
    { name: 'Día de la Cerveza', suggestion: 'Lanzar promoción 2x1 en cervezas artesanales.' },
    { name: 'Día del Amigo', suggestion: 'Crear combos de Fernet y aperitivos para bares.' },
    { name: 'Oktoberfest', suggestion: 'Asegurar stock de cervezas alemanas y merchandising.' },
    { name: 'Fiestas de Fin de Año', suggestion: 'Promocionar espumantes y vinos de alta gama.' },
    { name: 'Día de la Hamburguesa', suggestion: 'Ofrecer descuentos en cervezas a hamburgueserías.'},
    { name: 'Inicio de Verano', suggestion: 'Potenciar la venta de cervezas lager y bebidas blancas.'},
];

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getKpis() {
    const ordersRepo = this.dataSource.getRepository(Order);
    const expensesRepo = this.dataSource.getRepository(Expense);
    const productsRepo = this.dataSource.getRepository(Product);
    const orderItemsRepo = this.dataSource.getRepository(OrderItem);

    const { totalSales } = await ordersRepo.createQueryBuilder('order')
      .select('COALESCE(SUM(order.totalAmount), 0)', 'totalSales')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();

    const { totalExpenses } = await expensesRepo.createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount), 0)', 'totalExpenses')
      .getRawOne();
      
    const lowStockProducts = await productsRepo.count({ where: { stockQuantity: 0 } });
    const activeProducts = await productsRepo.count({ where: { isActive: true } });

    const { totalCostOfGoodsSold } = await orderItemsRepo.createQueryBuilder('item')
        .leftJoin('item.order', 'order')
        .leftJoin('item.product', 'product')
        .select('COALESCE(SUM(item.quantity * product.cost), 0)', 'totalCostOfGoodsSold')
        .where('order.status = :status', { status: OrderStatus.COMPLETED })
        .getRawOne();

    const grossProfit = parseFloat(totalSales) - parseFloat(totalCostOfGoodsSold);
    
    return {
      totalSales: parseFloat(totalSales),
      totalCostOfGoodsSold: parseFloat(totalCostOfGoodsSold),
      grossProfit: grossProfit,
      totalExpenses: parseFloat(totalExpenses),
      netResult: grossProfit - parseFloat(totalExpenses),
      lowStockProducts,
      activeProducts,
    };
  }

  getUpcomingEvents(): CommercialEventDto[] {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    const eventDates = {
        'Día de la Cerveza': new Date(today.getFullYear(), 7, 2), // Aug 2
        'Día del Amigo': new Date(today.getFullYear(), 6, 20), // Jul 20
        'Oktoberfest': new Date(today.getFullYear(), 9, 15), // Oct 15
        'Fiestas de Fin de Año': new Date(today.getFullYear(), 11, 1), // Dec 1
        'Día de la Hamburguesa': new Date(today.getFullYear(), 4, 28), // May 28
        'Inicio de Verano': new Date(today.getFullYear(), 11, 21), // Dec 21
    };

    const upcoming = commercialEvents
        .map(event => ({ ...event, date: eventDates[event.name] }))
        .filter(event => event.date instanceof Date && !isNaN(event.date.valueOf()))
        .filter(event => event.date >= today && event.date <= nextMonth)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
        
    return upcoming;
  }

  async getStockAnalysis() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const orderItemsRepo = this.dataSource.getRepository(OrderItem);

    const topSellingProducts = await orderItemsRepo.createQueryBuilder('item')
      .innerJoin('item.order', 'order')
      .innerJoin('item.product', 'product')
      .select('product.name', 'name')
      .addSelect('SUM(item.quantity)', 'totalSold')
      .where('order.createdAt >= :date', { date: ninetyDaysAgo })
      .groupBy('product.name')
      .orderBy('"totalSold"', 'DESC') // <-- CORRECCIÓN: Usar comillas dobles
      .limit(5)
      .getRawMany();

    const soldProductIdsQuery = orderItemsRepo.createQueryBuilder('item')
        .innerJoin('item.order', 'order')
        .select('DISTINCT item.productId', 'id')
        .where('order.createdAt >= :date', { date: ninetyDaysAgo });

    const slowMovingProducts = await this.dataSource.getRepository(Product)
      .createQueryBuilder('product')
      .where('product.isActive = true')
      .andWhere(`product.id NOT IN (${soldProductIdsQuery.getQuery()})`)
      .setParameters(soldProductIdsQuery.getParameters())
      .select(['product.id as id', 'product.name as name', 'product.stockQuantity as "stockQuantity"', 'product.cost as cost'])
      .getRawMany();

    return { topSellingProducts, slowMovingProducts };
  }

  async getSalesSuggestions(customerId: string): Promise<Product[]> {
    const productRepo = this.dataSource.getRepository(Product);
    const orderRepo = this.dataSource.getRepository(Order);
    const orderItemRepo = this.dataSource.getRepository(OrderItem);

    const customerOrders = await orderRepo.find({
      where: { customerId },
      relations: ['items', 'items.product'],
    });

    const purchasedProductIds = new Set<string>();
    customerOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) purchasedProductIds.add(item.product.id);
      });
    });

    const topProducts = await orderItemRepo
      .createQueryBuilder('item')
      .select('item.productId', 'productId')
      .addSelect('COUNT(item.id)', 'count')
      .groupBy('item.productId')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    const topProductIds = topProducts.map(p => p.productId);

    const suggestionIds = topProductIds.filter(id => !purchasedProductIds.has(id));

    if (suggestionIds.length === 0) {
      return [];
    }

    return productRepo.find({
      where: {
        id: In(suggestionIds),
      },
    });
  }
}