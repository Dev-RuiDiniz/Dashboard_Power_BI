import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { GroupsRepository } from './repositories/groups.repository';
import { AdminGroupsController } from './groups/admin-groups.controller';
import { AdminGroupsService } from './groups/admin-groups.service';
import { AdminUsersController } from './users/admin-users.controller';
import { AdminUsersService } from './users/admin-users.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController, AdminGroupsController],
  providers: [GroupsRepository, AdminUsersService, AdminGroupsService],
  exports: [GroupsRepository, AdminUsersService, AdminGroupsService],
})
export class AdminModule {}
