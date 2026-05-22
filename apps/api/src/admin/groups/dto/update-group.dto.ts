import { IsArray, IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { SectorCode, UserRole } from '../../../auth/types/auth.types';

const roles: UserRole[] = ['viewer', 'downloader', 'admin'];
const sectors: SectorCode[] = ['financeiro', 'comercial', 'operacoes', 'diretoria'];

export class UpdateGroupDto {
  @ApiPropertyOptional({ example: 'Financeiro - Visualizadores' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: roles, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(roles, { each: true })
  roles?: UserRole[];

  @ApiPropertyOptional({ enum: sectors, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(sectors, { each: true })
  sectors?: SectorCode[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
