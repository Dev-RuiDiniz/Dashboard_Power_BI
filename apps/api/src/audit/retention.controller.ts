import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TwoFactorGuard } from '../auth/guards/two-factor.guard';
import { RetentionService } from './services/retention.service';

@ApiTags('Retention')
@Controller('admin/retention')
@UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
@Roles('admin')
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Get('status')
  @ApiOperation({ summary: 'Retorna configurações atuais de retenção de dados (LGPD).' })
  @ApiOkResponse({ description: 'Configurações de retenção retornadas com sucesso.' })
  getStatus() {
    return this.retentionService.getRetentionConfig();
  }

  @Post('run')
  @ApiOperation({ summary: 'Executa retenção manualmente (anonimização e expurgo).' })
  @ApiOkResponse({ description: 'Retenção executada com sucesso.' })
  run() {
    return this.retentionService.runRetention();
  }
}
