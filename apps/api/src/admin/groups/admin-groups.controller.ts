import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TwoFactorGuard } from '../../auth/guards/two-factor.guard';
import { AdminGroupsService } from './admin-groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('Admin Groups')
@ApiBearerAuth()
@Controller('admin/groups')
@UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
@Roles('admin')
export class AdminGroupsController {
  constructor(private readonly adminGroupsService: AdminGroupsService) {}

  @Get()
  list() {
    return this.adminGroupsService.list();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.adminGroupsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateGroupDto) {
    return this.adminGroupsService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateGroupDto) {
    return this.adminGroupsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.adminGroupsService.delete(id);
  }
}
