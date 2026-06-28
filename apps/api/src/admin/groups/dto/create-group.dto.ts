import { ArrayNotEmpty, IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SectorCode, UserRole } from '../../../auth/types/auth.types';

const roles: UserRole[] = ['viewer', 'downloader', 'admin'];
const sectors: SectorCode[] = ['financeiro', 'comercial', 'operacoes', 'diretoria'];

export class CreateGroupDto {
  @ApiProperty({ example: 'Financeiro - Downloaders' })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiPropertyOptional({ example: 'Grupo com permissão de download no setor financeiro.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: roles, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(roles, { each: true })
  roles!: UserRole[];

  @ApiProperty({ enum: sectors, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(sectors, { each: true })
  sectors!: SectorCode[];

  @ApiPropertyOptional({ type: [String], description: 'IDs de permissões associadas ao grupo.' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionIds?: string[];
}
