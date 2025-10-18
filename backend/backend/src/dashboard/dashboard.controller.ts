import { Controller, Get, UseGuards, Param, ParseUUIDPipe } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { CommercialEventDto } from './dto/commercial-event.dto';

@Controller('dashboard')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  getKpis() {
    return this.dashboardService.getKpis();
  }

  @Get('events')
  getUpcomingEvents(): CommercialEventDto[] {
      return this.dashboardService.getUpcomingEvents();
  }

  @Get('stock-analysis')
  getStockAnalysis() {
    return this.dashboardService.getStockAnalysis();
  }

  @Get('suggestions/for-customer/:customerId')
  getSalesSuggestions(@Param('customerId', ParseUUIDPipe) customerId: string) {
      return this.dashboardService.getSalesSuggestions(customerId);
  }
}