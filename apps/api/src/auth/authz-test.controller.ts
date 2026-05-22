import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SectorsGuard } from './guards/sectors.guard';
import { AuthenticatedRequestUser, SectorCode } from './types/auth.types';

@ApiTags('Authz Test')
@ApiBearerAuth()
@Controller('authz-test')
@UseGuards(JwtAuthGuard, RolesGuard, SectorsGuard)
export class AuthzTestController {
  @Get('view/:sector')
  @Roles('viewer', 'downloader', 'admin')
  @ApiOkResponse({ description: 'Usuário possui permissão de visualização no setor.' })
  viewSector(@Param('sector') sector: SectorCode, @CurrentUser() user: AuthenticatedRequestUser) {
    return {
      action: 'view',
      sector,
      userId: user.sub,
    };
  }

  @Get('download/:sector')
  @Roles('downloader', 'admin')
  @ApiOkResponse({ description: 'Usuário possui permissão de download no setor.' })
  downloadSector(@Param('sector') sector: SectorCode, @CurrentUser() user: AuthenticatedRequestUser) {
    return {
      action: 'download',
      sector,
      userId: user.sub,
    };
  }

  @Get('admin')
  @Roles('admin')
  @ApiOkResponse({ description: 'Usuário possui permissão administrativa.' })
  adminOnly(@CurrentUser() user: AuthenticatedRequestUser) {
    return {
      action: 'admin',
      userId: user.sub,
    };
  }
}
