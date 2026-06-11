import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminDashboardService, AdminDashboardMetrics } from './admin-dashboard.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  @ApiOkResponse({ description: 'Retorna métricas operacionais do painel administrativo.' })
  getMetrics(): Promise<AdminDashboardMetrics> {
    return this.adminDashboardService.getMetrics();
  }
}
