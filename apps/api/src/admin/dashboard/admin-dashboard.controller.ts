import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { TwoFactorGuard } from '../../auth/guards/two-factor.guard';
import {
  AdminDashboardService,
  AdminDashboardMetrics,
  AdminDashboardTrends,
} from './admin-dashboard.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TwoFactorGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  @ApiOkResponse({ description: 'Retorna métricas operacionais do painel administrativo.' })
  getMetrics(): Promise<AdminDashboardMetrics> {
    return this.adminDashboardService.getMetrics();
  }

  @Get('trends')
  @ApiOkResponse({
    description: 'Retorna agregações temporais de tendências do painel administrativo.',
  })
  getTrends(): Promise<AdminDashboardTrends> {
    return this.adminDashboardService.getTrends();
  }
}
