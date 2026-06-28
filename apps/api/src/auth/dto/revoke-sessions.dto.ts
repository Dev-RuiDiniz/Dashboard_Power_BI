import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class RevokeSessionsDto {
  @ApiPropertyOptional({
    description: 'ID do usuário alvo. Se omitido, revoga as sessões do próprio usuário.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  userId?: string;
}
