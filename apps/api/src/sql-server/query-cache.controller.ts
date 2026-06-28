import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TwoFactorGuard } from '../auth/guards/two-factor.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { QueryCacheService, QueryCacheStats } from './query-cache.service';

@ApiTags('admin/cache')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
@Roles('admin')
@Controller('admin/cache')
export class QueryCacheController {
  constructor(private readonly queryCacheService: QueryCacheService) {}

  @Post('invalidate')
  @ApiOkResponse({ description: 'Invalida todas as entradas do cache de queries.' })
  invalidateAll(): { invalidated: true } {
    this.queryCacheService.invalidateAll();
    return { invalidated: true };
  }

  @Get('stats')
  @ApiOkResponse({ description: 'Retorna estatísticas do cache de queries.' })
  getStats(): QueryCacheStats {
    return this.queryCacheService.getStats();
  }
}
