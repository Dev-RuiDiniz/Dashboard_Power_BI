import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import {
  CreateDashboardInput,
  DashboardsService,
  UpdateDashboardInput,
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
}
