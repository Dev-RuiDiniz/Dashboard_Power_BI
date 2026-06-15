import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequestUser } from '../auth/types/auth.types';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { PaginatedResponse, PublicReportDefinition } from './dto/report-query-response.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { ReportFavoritesService } from './report-favorites.service';
import { ReportsApiService } from './reports-api.service';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsApiService: ReportsApiService,
    private readonly reportFavoritesService: ReportFavoritesService,
  ) {}

  @Get()
  @ApiQuery({ name: 'sector', required: false, example: 'financeiro' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiOkResponse({ description: 'Lista relatórios autorizados com paginação.' })
  listReports(
    @Query() query: ListReportsQueryDto,
    @CurrentUser() user?: AuthenticatedRequestUser,
  ): Promise<PaginatedResponse<PublicReportDefinition>> {
    return this.reportsApiService.listReports(query, user);
  }

  @Get('favorites')
  @ApiOkResponse({ description: 'Lista os relatórios favoritos do usuário autenticado.' })
  listFavorites(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.reportFavoritesService.listForUser(user.sub);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Retorna o detalhe autorizado de um relatório.' })
  getReportById(
    @Param('id') id: string,
    @CurrentUser() user?: AuthenticatedRequestUser,
  ): Promise<PublicReportDefinition> {
    return this.reportsApiService.getReportById(id, user);
  }

  @Post(':id/favorite')
  @ApiOkResponse({ description: 'Marca um relatório como favorito.' })
  favorite(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.reportFavoritesService.favorite(user.sub, id);
  }

  @Delete(':id/favorite')
  @ApiOkResponse({ description: 'Remove um relatório dos favoritos.' })
  unfavorite(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.reportFavoritesService.unfavorite(user.sub, id);
  }

  @Post(':id/query')
  @ApiOkResponse({ description: 'Executa consulta parametrizada do relatório autorizado.' })
  queryReport(
    @Param('id') id: string,
    @Body() body: QueryReportDto,
    @CurrentUser() user?: AuthenticatedRequestUser,
  ): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.reportsApiService.queryReport(id, body, user);
  }
}
