import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PriceList } from '@/price-lists/entities/price-list.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ name: 'cuit_dni', unique: true, nullable: true })
  cuitDni: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  
  @Column({ name: 'price_list_id', nullable: true })
  priceListId: number;

  @ManyToOne(() => PriceList, { nullable: true, eager: false }) // 'eager' en false es mejor para el rendimiento
  @JoinColumn({ name: 'price_list_id' })
  priceList: PriceList;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}