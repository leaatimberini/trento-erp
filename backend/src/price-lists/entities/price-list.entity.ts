import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { NumericTransformer } from '@/common/transformers/numeric.transformer';

@Entity('price_lists')
export class PriceList {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ 
    name: 'margin_percentage', 
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: new NumericTransformer(),
  })
  marginPercentage: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}