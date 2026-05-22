import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token temporário opaco recebido por e-mail.',
    minLength: 32,
  })
  @IsString()
  @MinLength(32)
  token!: string;

  @ApiProperty({ example: 'NovaSenha123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
