import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TwoFactorGuard } from '../auth/guards/two-factor.guard';
import { AuthenticatedRequestUser } from '../auth/types/auth.types';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
@Roles('admin')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as permissoes' })
  @ApiOkResponse({ description: 'Lista de permissoes retornada com sucesso.' })
  async list() {
    return this.permissionsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca permissao por ID' })
  @ApiOkResponse({ description: 'Permissao retornada com sucesso.' })
  async getById(@Param('id') id: string) {
    return this.permissionsService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria nova permissao' })
  @ApiOkResponse({ description: 'Permissao criada com sucesso.' })
  async create(@CurrentUser() user: AuthenticatedRequestUser, @Body() dto: CreatePermissionDto) {
    return this.permissionsService.create({ userId: user.sub, userEmail: user.email }, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza permissao existente' })
  @ApiOkResponse({ description: 'Permissao atualizada com sucesso.' })
  async update(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update({ userId: user.sub, userEmail: user.email }, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove permissao' })
  @ApiOkResponse({ description: 'Permissao removida com sucesso.' })
  async delete(@CurrentUser() user: AuthenticatedRequestUser, @Param('id') id: string) {
    return this.permissionsService.delete({ userId: user.sub, userEmail: user.email }, id);
  }
}
