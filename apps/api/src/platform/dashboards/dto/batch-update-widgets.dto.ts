import { IsString, IsOptional, IsObject, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class BatchWidgetPositionDto {
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

export class BatchUpdateWidgetItemDto {
  @ApiProperty({ example: 'widget-uuid' })
  @IsString()
  widgetId!: string;

  @ApiProperty({ required: false, type: BatchWidgetPositionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BatchWidgetPositionDto)
  position?: BatchWidgetPositionDto;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty({ example: 'Título atualizado', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'bar', required: false })
  @IsOptional()
  @IsString()
  chartType?: string | null;

  @ApiProperty({ example: 'kpi-uuid', required: false })
  @IsOptional()
  @IsString()
  kpiId?: string | null;

  @ApiProperty({ example: { color: '#333' }, required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;

  @ApiProperty({ example: 'Conteúdo atualizado', required: false })
  @IsOptional()
  @IsString()
  content?: string | null;

  @ApiProperty({ example: 'https://example.com', required: false })
  @IsOptional()
  @IsString()
  url?: string | null;
}

export class BatchUpdateWidgetsDto {
  @ApiProperty({ type: [BatchUpdateWidgetItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateWidgetItemDto)
  items!: BatchUpdateWidgetItemDto[];
}
