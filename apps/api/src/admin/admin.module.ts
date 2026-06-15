import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { PlatformModule } from '../platform/platform.module';
import { AdminDashboardController } from './dashboard/admin-dashboard.controller';
import { AdminDashboardService } from './dashboard/admin-dashboard.service';
import { GroupsRepository } from './repositories/groups.repository';
import { AdminGroupsController } from './groups/admin-groups.controller';
import { AdminGroupsService } from './groups/admin-groups.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  imports: [AuthModule, PlatformModule, AuditModule],
  controllers: [AdminUsersController, AdminGroupsController, AdminDashboardController],
  providers: [GroupsRepository, AdminUsersService, AdminGroupsService, AdminDashboardService],
  exports: [GroupsRepository, AdminUsersService, AdminGroupsService, AdminDashboardService],
})
export class AdminModule {}
