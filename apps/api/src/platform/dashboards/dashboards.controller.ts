import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { CreateWidgetDto } from './dto/create-widget.dto';
import { UpdateWidgetDto } from './dto/update-widget.dto';
import { BatchUpdateWidgetsDto } from './dto/batch-update-widgets.dto';
import { ReorderWidgetsDto } from './dto/reorder-widgets.dto';

@ApiTags('dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lista dashboards personalizados do usuario autenticado.' })
  async list(@CurrentUser() user: AuthenticatedRequestUser) {
    const dashboards = await this.dashboardsService.listForUser(user.sub);

    if (dashboards.length === 0) {
      const seeded = await this.dashboardsService.ensureDefaultDashboardForUser(
        user.sub,
        user.sectors,
      );
      return { dashboards: [seeded], seededViaApi: true };
    }

    return { dashboards, seededViaApi: false };
  }

  @Post()
  @ApiOkResponse({ description: 'Cria um dashboard personalizado.' })
  create(@CurrentUser() user: AuthenticatedRequestUser, @Body() body: CreateDashboardDto) {
    return this.dashboardsService.createForUser(user.sub, body);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Retorna um dashboard especifico do usuario.' })
  getById(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.dashboardsService.getByIdForUser(user.sub, id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Atualiza um dashboard personalizado.' })
  update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() body: UpdateDashboardDto,
  ) {
    return this.dashboardsService.updateForUser(user.sub, id, body);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Remove um dashboard personalizado.' })
  remove(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.dashboardsService.deleteForUser(user.sub, id);
  }

  @Post(':id/widgets')
  @ApiOkResponse({ description: 'Adiciona um widget ao dashboard.' })
  addWidget(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() body: CreateWidgetDto,
  ) {
    return this.dashboardsService.addWidget(user.sub, id, body);
  }

  @Patch(':id/widgets/:widgetId')
  @ApiOkResponse({ description: 'Atualiza um widget do dashboard.' })
  updateWidget(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Param('widgetId') widgetId: string,
    @Body() body: UpdateWidgetDto,
  ) {
    return this.dashboardsService.updateWidget(user.sub, id, widgetId, body);
  }

  @Patch(':id/widgets/reorder')
  @ApiOkResponse({ description: 'Reordena os widgets do dashboard.' })
  reorderWidgets(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() body: ReorderWidgetsDto,
  ) {
    return this.dashboardsService.reorderWidgets(user.sub, id, body.items);
  }

  @Patch(':id/widgets/batch')
  @ApiOkResponse({ description: 'Atualiza múltiplos widgets em lote (posição, config, etc).' })
  batchUpdateWidgets(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() body: BatchUpdateWidgetsDto,
  ) {
    return this.dashboardsService.batchUpdateWidgets(user.sub, id, body.items);
  }

  @Delete(':id/widgets/:widgetId')
  @ApiOkResponse({ description: 'Remove um widget do dashboard.' })
  removeWidget(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Param('widgetId') widgetId: string,
  ) {
    return this.dashboardsService.removeWidget(user.sub, id, widgetId);
  }
}
