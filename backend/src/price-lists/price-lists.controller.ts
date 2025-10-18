import { Controller, Get, Post, Body, Param, UseGuards, ValidationPipe, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { PriceListsService } from './price-lists.service';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UpdatePriceListDto } from './dto/update-price-list.dto';

@Controller('price-lists')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class PriceListsController {
  constructor(private readonly priceListsService: PriceListsService) {}

  @Post()
  create(@Body(ValidationPipe) createPriceListDto: CreatePriceListDto) {
    return this.priceListsService.create(createPriceListDto);
  }

  @Get()
  findAll() {
    return this.priceListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.priceListsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body(ValidationPipe) updatePriceListDto: UpdatePriceListDto) {
    return this.priceListsService.update(id, updatePriceListDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.priceListsService.remove(id);
  }
}