import { Order } from '@/orders/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('delivery_routes')
export class DeliveryRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_name' })
  driverName: string;

  @Column({ name: 'route_date', type: 'date' })
  routeDate: string;

  @Column()
  status: string; // 'pending', 'in_progress', 'completed'

  @OneToMany(() => Order, order => order.deliveryRoute)
  orders: Order[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}