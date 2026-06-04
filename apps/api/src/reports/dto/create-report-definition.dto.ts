import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ReportParameterDefinition, ReportSourceType } from '../entities/report-definition.entity';

export class CreateReportDefinitionDto {
  @ApiProperty({ example: 'Relatório Financeiro' })
  name!: string;

  @ApiProperty({ example: 'Visão consolidada do setor financeiro.' })
  description!: string;

  @ApiProperty({ example: 'financeiro' })
  sector!: string;

  @ApiProperty({ enum: ['view', 'stored_procedure'], example: 'view' })
  sourceType!: ReportSourceType;

  @ApiProperty({ example: 'reports.vw_financial_reports' })
  sourceName!: string;

  @ApiPropertyOptional({
    example: [{ name: 'startDate', type: 'date', required: true }],
  })
  parameters: ReportParameterDefinition[] = [];

  @ApiPropertyOptional({ example: ['reports:financeiro:read'] })
  requiredPermissions: string[] = [];

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;
}
