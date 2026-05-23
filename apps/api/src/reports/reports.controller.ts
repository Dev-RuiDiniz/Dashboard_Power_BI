import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ReportDefinition } from './entities/report-definition.entity';
import { ReportDefinitionsService } from './report-definitions.service';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportDefinitionsService: ReportDefinitionsService) {}

  @Get()
  @ApiQuery({ name: 'sector', required: true, example: 'financeiro' })
  @ApiOkResponse({ description: 'Lista relatórios ativos por setor.' })
  listBySector(@Query('sector') sector: string): Promise<ReportDefinition[]> {
    return this.reportDefinitionsService.listBySector(sector);
  }
}
