import { Customer } from '@/customers/entities/customer.entity';
import { NumericTransformer } from '@/common/transformers/numeric.transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('customer_payments')
export class CustomerPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @Column({ name: 'payment_date', type: 'timestamptz' })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: new NumericTransformer() })
  amount: number;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}