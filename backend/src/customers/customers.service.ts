import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerPaymentsService } from '@/customer-payments/customer-payments.service';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly paymentsService: CustomerPaymentsService,
  ) {}

  create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  findAll(): Promise<Customer[]> {
    return this.customerRepository.find();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.customerRepository.preload({
      id,
      ...updateCustomerDto,
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID "${id}" not found`);
    }
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  async getAccountStatement(id: string) {
    const customer = await this.findOne(id);
    const balance = await this.paymentsService.getAccountBalance(id);
    return {
      customer,
      balance,
    };
  }

  async findAllWithBalances() {
    const customers = await this.customerRepository.find();
    const balances = await Promise.all(
        customers.map(customer => this.paymentsService.getAccountBalance(customer.id))
    );

    return customers.map((customer, index) => ({
        ...customer,
        balance: balances[index],
    }));
  }
}