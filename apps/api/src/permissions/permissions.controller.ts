import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@Controller('admin/permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as permissões' })
  @ApiOkResponse({ description: 'Lista de permissões retornada com sucesso.' })
  async list() {
    return this.permissionsService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca permissão por ID' })
  @ApiOkResponse({ description: 'Permissão retornada com sucesso.' })
  async getById(@Param('id') id: string) {
    return this.permissionsService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria nova permissão' })
  @ApiOkResponse({ description: 'Permissão criada com sucesso.' })
  async create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza permissão existente' })
  @ApiOkResponse({ description: 'Permissão atualizada com sucesso.' })
  async update(@Param('id') id: string, @Body() dto: UpdatePermissionDto) {
    return this.permissionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove permissão' })
  @ApiOkResponse({ description: 'Permissão removida com sucesso.' })
  async delete(@Param('id') id: string) {
    return this.permissionsService.delete(id);
  }
}
