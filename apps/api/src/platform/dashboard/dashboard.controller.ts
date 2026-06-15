import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('home')
  @ApiOkResponse({ description: 'Retorna payload consolidado da home de BI.' })
  getHome() {
    return this.dashboardService.getHome();
  }

  @Get('kpis')
  @ApiOkResponse({ description: 'Lista KPIs ativos para o dashboard home.' })
  listKpis() {
    return this.dashboardService.listKpis();
  }

  @Get('kpis/:kpiId/drilldown')
  @ApiOkResponse({ description: 'Retorna o drill-down tabular do KPI selecionado.' })
  getKpiDrilldown(@Param('kpiId') kpiId: string) {
    return this.dashboardService.getKpiDrilldown(kpiId);
  }

  @Get('kpis/:kpiId/history')
  @ApiOkResponse({ description: 'Retorna serie historica do KPI (12 meses).' })
  getKpiHistory(@Param('kpiId') kpiId: string) {
    return this.dashboardService.getKpiHistory(kpiId);
  }

  @Get('sectors')
  @ApiOkResponse({ description: 'Lista setores ativos.' })
  listSectors() {
    return this.dashboardService.listSectors();
  }
}
