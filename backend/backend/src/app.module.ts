import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos de la aplicación
import { ConfigurationModule } from './configuration/configuration.module';
import { ProductsModule } from './products/products.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { PriceListsModule } from './price-lists/price-lists.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { CustomerPaymentsModule } from './customer-payments/customer-payments.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DeliveryRoutesModule } from './delivery-routes/delivery-routes.module';
import { DashboardModule } from './dashboard/dashboard.module';

// Entidades para TypeORM
import { Configuration } from './configuration/entities/configuration.entity';
import { Product } from './products/entities/product.entity';
import { Customer } from './customers/entities/customer.entity';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { User } from './auth/entities/user.entity';
import { Role } from './auth/entities/role.entity';
import { PriceList } from './price-lists/entities/price-list.entity';
import { Supplier } from './suppliers/entities/supplier.entity';
import { PurchaseOrder } from './purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderItem } from './purchase-orders/entities/purchase-order-item.entity';
import { CustomerPayment } from './customer-payments/entities/customer-payment.entity';
import { Expense } from './expenses/entities/expense.entity';
import { ExpenseCategory } from './expenses/entities/expense-category.entity';
import { DeliveryRoute } from './delivery-routes/entities/delivery-route.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [
        Configuration, 
        Product, 
        Customer, 
        Order, 
        OrderItem,
        User,
        Role,
        PriceList,
        Supplier,
        PurchaseOrder,
        PurchaseOrderItem,
        CustomerPayment,
        Expense,
        ExpenseCategory,
        DeliveryRoute
      ],
      synchronize: false,
      logging: true,
    }),
    ConfigurationModule,
    ProductsModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    AuthModule,
    PriceListsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    CustomerPaymentsModule,
    ExpensesModule,
    DeliveryRoutesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}