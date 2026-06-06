import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'reports:financeiro:read' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ example: 'Ler relatórios financeiros' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Permite visualizar relatórios do setor financeiro' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'reports' })
  @IsString()
  @IsNotEmpty()
  resource!: string;

  @ApiProperty({ example: 'read' })
  @IsString()
  @IsNotEmpty()
  action!: string;
}
