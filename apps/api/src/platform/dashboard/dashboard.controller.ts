import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('home')
  @ApiOkResponse({ description: 'Retorna payload consolidado da home de BI.' })
  getHome(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.dashboardService.getHome(user.sectors);
  }

  @Get('kpis')
  @ApiOkResponse({ description: 'Lista KPIs ativos para o dashboard home.' })
  listKpis(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.dashboardService.listKpis(user.sectors);
  }

  @Get('kpis/:kpiId/drilldown')
  @ApiOkResponse({ description: 'Retorna o drill-down tabular do KPI selecionado.' })
  getKpiDrilldown(@CurrentUser() user: AuthenticatedRequestUser, @Param('kpiId') kpiId: string) {
    return this.dashboardService.getKpiDrilldown(kpiId, user.sectors);
  }

  @Get('kpis/:kpiId/history')
  @ApiOkResponse({ description: 'Retorna serie historica do KPI (12 meses).' })
  getKpiHistory(@CurrentUser() user: AuthenticatedRequestUser, @Param('kpiId') kpiId: string) {
    return this.dashboardService.getKpiHistory(kpiId, user.sectors);
  }

  @Get('sectors')
  @ApiOkResponse({ description: 'Lista setores ativos.' })
  listSectors() {
    return this.dashboardService.listSectors();
  }
}
