import { IsString, IsOptional, IsBoolean, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDashboardDto {
  @ApiProperty({ example: 'Dashboard Financeiro' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Dashboard de indicadores financeiros', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ example: { columns: 12 }, required: false })
  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;
}
