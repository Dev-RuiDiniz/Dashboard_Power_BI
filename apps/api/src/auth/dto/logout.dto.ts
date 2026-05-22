import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token atual que deve ser invalidado.',
    minLength: 32,
  })
  @IsString()
  @MinLength(32)
  refreshToken!: string;
}
