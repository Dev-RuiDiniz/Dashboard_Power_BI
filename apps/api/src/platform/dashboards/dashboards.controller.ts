import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import {
  CreateDashboardInput,
  CreateWidgetInput,
  DashboardsService,
  UpdateDashboardInput,
  UpdateWidgetInput,
} from './dashboards.service';

@ApiTags('dashboards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  @ApiOkResponse({ description: 'Lista dashboards personalizados do usuario autenticado.' })
  list(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.dashboardsService.listForUser(user.sub);
  }

  @Post()
  @ApiOkResponse({ description: 'Cria um dashboard personalizado.' })
  create(@CurrentUser() user: AuthenticatedRequestUser, @Body() body: CreateDashboardInput) {
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
    @Body() body: UpdateDashboardInput,
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
    @Body() body: CreateWidgetInput,
  ) {
    return this.dashboardsService.addWidget(user.sub, id, body);
  }

  @Patch(':id/widgets/:widgetId')
  @ApiOkResponse({ description: 'Atualiza um widget do dashboard.' })
  updateWidget(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Param('widgetId') widgetId: string,
    @Body() body: UpdateWidgetInput,
  ) {
    return this.dashboardsService.updateWidget(user.sub, id, widgetId, body);
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
