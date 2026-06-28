import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TwoFactorGuard } from '../auth/guards/two-factor.guard';
import { CreateReportDefinitionDto } from './dto/create-report-definition.dto';
import { UpdateReportDefinitionDto } from './dto/update-report-definition.dto';
import { ValidateReportSourceDto } from './dto/validate-report-source.dto';
import { ReportDefinition } from './entities/report-definition.entity';
import { ReportDefinitionsService, ValidateSourceResult } from './report-definitions.service';

@ApiTags('admin-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
@Roles('admin')
@Controller('admin/reports')
export class ReportDefinitionsAdminController {
  constructor(private readonly reportDefinitionsService: ReportDefinitionsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Cria uma definição de relatório.' })
  create(@Body() dto: CreateReportDefinitionDto): Promise<ReportDefinition> {
    return this.reportDefinitionsService.create(dto);
  }

  @Get()
  @ApiOkResponse({ description: 'Lista definições de relatórios cadastradas.' })
  list(): Promise<ReportDefinition[]> {
    return this.reportDefinitionsService.list();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Busca uma definição de relatório por ID.' })
  getById(@Param('id') id: string): Promise<ReportDefinition> {
    return this.reportDefinitionsService.getById(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Atualiza parcialmente uma definição de relatório.' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReportDefinitionDto,
  ): Promise<ReportDefinition> {
    return this.reportDefinitionsService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOkResponse({ description: 'Desativa uma definição de relatório.' })
  deactivate(@Param('id') id: string): Promise<ReportDefinition> {
    return this.reportDefinitionsService.deactivate(id);
  }

  @Post('validate')
  @ApiOkResponse({ description: 'Valida se a fonte SQL existe e é acessível.' })
  validateSource(@Body() dto: ValidateReportSourceDto): Promise<ValidateSourceResult> {
    return this.reportDefinitionsService.validateSource(dto.sourceType, dto.sourceName);
  }
}
