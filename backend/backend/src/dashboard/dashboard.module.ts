import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
// No necesita TypeOrmModule porque el servicio usa el DataSource global

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}