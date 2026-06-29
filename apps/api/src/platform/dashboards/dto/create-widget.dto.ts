import {
  IsString,
  IsOptional,
  IsObject,
  IsNotEmpty,
  IsNumber,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class WidgetPositionDto {
  @ApiProperty({ example: 0 })
  @IsNumber()
  x!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  y!: number;

  @ApiProperty({ example: 6 })
  @IsNumber()
  width!: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  height!: number;
}

export class CreateWidgetDto {
  @ApiProperty({ example: 'chart', enum: ['chart', 'kpi', 'table', 'text', 'iframe'] })
  @IsString()
  @IsNotEmpty()
  @IsIn(['chart', 'kpi', 'table', 'text', 'iframe'])
  widgetType!: 'chart' | 'kpi' | 'table' | 'text' | 'iframe';

  @ApiProperty({ example: 'Vendas por mês' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'bar', required: false })
  @IsOptional()
  @IsString()
  chartType?: string | null;

  @ApiProperty({ example: 'report-uuid', required: false })
  @IsOptional()
  @IsString()
  reportId?: string | null;

  @ApiProperty({ example: 'kpi-uuid', required: false })
  @IsOptional()
  @IsString()
  kpiId?: string | null;

  @ApiProperty({ example: { color: '#333' }, required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiProperty({ example: 'Texto do widget', required: false })
  @IsOptional()
  @IsString()
  content?: string | null;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  url?: string | null;

  @ApiProperty({ required: false, type: WidgetPositionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => WidgetPositionDto)
  position?: WidgetPositionDto;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
