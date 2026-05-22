import { IsArray, IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { SectorCode, UserRole } from '../../../auth/types/auth.types';

const roles: UserRole[] = ['viewer', 'downloader', 'admin'];
const sectors: SectorCode[] = ['financeiro', 'comercial', 'operacoes', 'diretoria'];

export class UpdateAdminUserDto {
  @ApiPropertyOptional({ example: 'usuario@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];
}
