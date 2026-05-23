import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryReportDto {
  @ApiPropertyOptional({
    example: {
      startDate: '2026-05-01',
      sectorId: 'financeiro',
    },
  })
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 1, default: 1 })
  page?: number | string;

  @ApiPropertyOptional({ example: 20, default: 20, maximum: 100 })
  pageSize?: number | string;
}
