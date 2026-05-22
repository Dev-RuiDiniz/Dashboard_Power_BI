import { ArrayNotEmpty, IsArray, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SectorCode, UserRole } from '../../../auth/types/auth.types';

const roles: UserRole[] = ['viewer', 'downloader', 'admin'];
const sectors: SectorCode[] = ['financeiro', 'comercial', 'operacoes', 'diretoria'];

export class CreateAdminUserDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SenhaInicial123!' })
  @IsString()
  @MinLength(8)
  password!: string;

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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  groupIds?: string[];
}
