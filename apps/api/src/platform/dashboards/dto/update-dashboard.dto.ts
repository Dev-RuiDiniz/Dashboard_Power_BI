import { IsString, IsOptional, IsBoolean, IsObject, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDashboardDto {
  @ApiProperty({ example: 'Dashboard Financeiro Atualizado', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ example: 'Descrição atualizada', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({ example: { columns: 24 }, required: false })
  @IsOptional()
  @IsObject()
  layout?: Record<string, unknown>;
}
