import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOkResponse({ description: 'Lista KPIs ativos para o dashboard home.' })
  listKpis() {
    return this.dashboardService.listKpis();
  }

  @Get('sectors')
  @ApiOkResponse({ description: 'Lista setores ativos.' })
  listSectors() {
    return this.dashboardService.listSectors();
  }
}
