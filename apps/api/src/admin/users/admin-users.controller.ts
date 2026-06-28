import { Body, Controller, Get, Param, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { TwoFactorGuard } from '../../auth/guards/two-factor.guard';
import { AdminUsersService } from './admin-users.service';
import { AssignUserGroupsDto } from './dto/assign-user-groups.dto';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { ResetAdminUserPasswordDto } from './dto/reset-admin-user-password.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard, TwoFactorGuard)
@Roles('admin')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  list() {
    return this.adminUsersService.list();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.adminUsersService.getById(id);
  }

  @Post()
  create(@Body() body: CreateAdminUserDto) {
    return this.adminUsersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAdminUserDto) {
    return this.adminUsersService.update(id, body);
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.adminUsersService.deactivate(id);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() body: ResetAdminUserPasswordDto) {
    return this.adminUsersService.resetPassword(id, body);
  }

  @Put(':id/groups')
  assignGroups(@Param('id') id: string, @Body() body: AssignUserGroupsDto) {
    return this.adminUsersService.assignGroups(id, body);
  }
}
