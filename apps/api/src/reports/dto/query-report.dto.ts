import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class QueryReportDto {
  @ApiPropertyOptional({
    example: {
      startDate: '2026-05-01',
      sectorId: 'financeiro',
    },
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number | string;

  @ApiPropertyOptional({ example: 20, default: 20, maximum: 100 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number | string;
}
