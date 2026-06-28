import { Injectable, Logger } from '@nestjs/common';

import { GroupsRepository } from '../admin/repositories/groups.repository';
import { UsersRepository } from '../auth/repositories/users.repository';
import { PermissionsRepository } from './repositories/permissions.repository';

@Injectable()
export class EffectivePermissionsService {
  private readonly logger = new Logger(EffectivePermissionsService.name);

  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly permissionsRepository: PermissionsRepository,
  ) {}

  async getEffectivePermissionCodes(userId: string): Promise<string[]> {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.isActive) {
      return [];
    }

    const groupIds = user.groupIds ?? [];

    if (groupIds.length === 0) {
      return [];
    }

    const allGroups = await this.groupsRepository.findAll();
    const activeGroups = allGroups.filter((g) => groupIds.includes(g.id) && g.isActive);

    const permissionIds = new Set<string>();

    for (const group of activeGroups) {
      for (const permId of group.permissionIds) {
        permissionIds.add(permId);
      }
    }

    if (permissionIds.size === 0) {
      return [];
    }

    const allPermissions = await this.permissionsRepository.findAll();
    const activePermissionCodes = new Set<string>();

    for (const perm of allPermissions) {
      if (perm.isActive && permissionIds.has(perm.id)) {
        activePermissionCodes.add(perm.code);
      }
    }

    return Array.from(activePermissionCodes);
  }

  async hasPermission(userId: string, requiredCode: string): Promise<boolean> {
    const codes = await this.getEffectivePermissionCodes(userId);

    return codes.includes(requiredCode);
  }
}
