import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token opaco emitido no login ou refresh anterior.',
    minLength: 32,
  })
  @IsString()
  @MinLength(32)
  refreshToken!: string;
}
