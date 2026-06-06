import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateExportDto {
  @ApiPropertyOptional({ example: 'report-1' })
  @IsOptional()
  @IsString()
  reportId?: string;

  @ApiProperty({ enum: ['pdf', 'excel', 'csv', 'json'], example: 'csv' })
  @IsIn(['pdf', 'excel', 'csv', 'json'])
  exportFormat!: 'pdf' | 'excel' | 'csv' | 'json';

  @ApiPropertyOptional({ example: { startDate: '2026-01-01' } })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;
}
