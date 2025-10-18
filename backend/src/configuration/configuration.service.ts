import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuration } from './entities/configuration.entity';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private readonly configurationRepository: Repository<Configuration>,
  ) {}

  async findOne(): Promise<Configuration> {
    const settings = await this.configurationRepository.find();
    if (settings.length === 0) {
      throw new NotFoundException('Configuration not found. Please set it up first.');
    }
    return settings[0];
  }

  async createOrUpdate(
    updateConfigurationDto: UpdateConfigurationDto,
  ): Promise<Configuration> {
    const settings = await this.configurationRepository.find();
    
    if (settings.length > 0) {
      // Update existing
      const existingSetting = settings[0];
      this.configurationRepository.merge(existingSetting, updateConfigurationDto);
      return this.configurationRepository.save(existingSetting);
    } else {
      // Create new
      const newSetting = this.configurationRepository.create(updateConfigurationDto);
      return this.configurationRepository.save(newSetting);
    }
  }
}