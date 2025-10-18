import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ExpenseCategory } from './expense-category.entity';
import { NumericTransformer } from '@/common/transformers/numeric.transformer';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: new NumericTransformer() })
  amount: number;

  @Column({ name: 'expense_date', type: 'timestamptz' })
  expenseDate: Date;

  @Column({ name: 'category_id', nullable: true })
  categoryId: number;

  @ManyToOne(() => ExpenseCategory, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: ExpenseCategory;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}