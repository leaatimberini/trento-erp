import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ExpenseCategory } from './entities/expense-category.entity';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(ExpenseCategory)
    private readonly categoryRepository: Repository<ExpenseCategory>,
  ) {}

  create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  findAll(): Promise<Expense[]> {
    return this.expenseRepository.find({ 
        relations: ['category'],
        order: { expenseDate: 'DESC' } 
    });
  }

  findAllCategories(): Promise<ExpenseCategory[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: string): Promise<Expense> {
    const expense = await this.expenseRepository.findOneBy({ id });
    if (!expense) throw new NotFoundException(`Expense with ID ${id} not found`);
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
    const expense = await this.expenseRepository.preload({ id, ...updateExpenseDto });
    if (!expense) throw new NotFoundException(`Expense with ID ${id} not found`);
    return this.expenseRepository.save(expense);
  }

  async remove(id: string): Promise<void> {
    const expense = await this.findOne(id);
    await this.expenseRepository.remove(expense);
  }
}