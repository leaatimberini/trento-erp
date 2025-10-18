import { Controller, Get, Body, Put, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { Configuration } from './entities/configuration.entity';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';

@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findOne(): Promise<Configuration> {
    return this.configurationService.findOne();
  }

  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createOrUpdate(@Body() updateConfigurationDto: UpdateConfigurationDto): Promise<Configuration> {
    return this.configurationService.createOrUpdate(updateConfigurationDto);
  }
}