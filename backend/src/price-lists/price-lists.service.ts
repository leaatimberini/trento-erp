import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceList } from './entities/price-list.entity';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';

@Injectable()
export class PriceListsService {
  constructor(
    @InjectRepository(PriceList) private readonly priceListRepository: Repository<PriceList>,
  ) {}

  findAll() {
    return this.priceListRepository.find();
  }

  async findOne(id: number): Promise<PriceList> {
    const priceList = await this.priceListRepository.findOneBy({ id });
    if (!priceList) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }
    return priceList;
  }

  create(createPriceListDto: CreatePriceListDto) {
    const priceList = this.priceListRepository.create(createPriceListDto);
    return this.priceListRepository.save(priceList);
  }

  async update(id: number, updatePriceListDto: UpdatePriceListDto) {
    const priceList = await this.priceListRepository.preload({
      id,
      ...updatePriceListDto,
    });
    if (!priceList) {
      throw new NotFoundException(`Price list with ID ${id} not found`);
    }
    return this.priceListRepository.save(priceList);
  }

  async remove(id: number): Promise<void> {
    const priceList = await this.findOne(id);
    await this.priceListRepository.remove(priceList);
  }
}