import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getDashboardStats() {
    return this.dashboardService.getDashboardStats();
  }

  @Get('inventory')
  getInventoryStats() {
    return this.dashboardService.getInventoryStats();
  }

  @Get('recent-sales')
  getRecentSales() {
    return this.dashboardService.getRecentSales();
  }

  @Get('top-products')
  getTopProducts() {
    return this.dashboardService.getTopProducts();
  }

  @Get('inventory-summary')
  getInventorySummary() {
    return this.dashboardService.getInventorySummary();
  }

  @Get('sales')
  getSalesStats(@Query('days') days?: string) {
    const daysNum = days ? parseInt(days, 10) : 30;
    return this.dashboardService.getSalesStats(daysNum);
  }
}