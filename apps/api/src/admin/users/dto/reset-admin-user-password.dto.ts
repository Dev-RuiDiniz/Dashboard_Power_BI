import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetAdminUserPasswordDto {
  @ApiProperty({ example: 'NovaSenha123!' })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
