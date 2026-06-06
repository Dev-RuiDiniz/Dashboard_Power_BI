import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'reports:financeiro:read' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  code?: string;

  @ApiPropertyOptional({ example: 'Ler relatórios financeiros' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Permite visualizar relatórios do setor financeiro' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'reports' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  resource?: string;

  @ApiPropertyOptional({ example: 'read' })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  action?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
