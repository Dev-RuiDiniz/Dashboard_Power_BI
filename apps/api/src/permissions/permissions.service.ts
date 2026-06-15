import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../audit/audit.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsRepository } from './repositories/permissions.repository';

type PermissionActor = {
  userId: string;
  userEmail: string;
};

@Injectable()
export class PermissionsService {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly auditService: AuditService,
  ) {}

  async list() {
    return this.permissionsRepository.findAll();
  }

  async getById(id: string) {
    const permission = await this.permissionsRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissao nao encontrada.');
    }

    return permission;
  }

  async create(actor: PermissionActor, dto: CreatePermissionDto) {
    const permission = await this.permissionsRepository.create(dto);

    await this.auditService.log({
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'permissions.created',
      resource: 'permissions',
      resourceId: permission.id,
      details: {
        code: permission.code,
        resource: permission.resource,
        permissionAction: permission.action,
      },
    });

    return permission;
  }

  async update(actor: PermissionActor, id: string, dto: UpdatePermissionDto) {
    const permission = await this.permissionsRepository.update(id, dto);

    if (!permission) {
      throw new NotFoundException('Permissao nao encontrada.');
    }

    await this.auditService.log({
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'permissions.updated',
      resource: 'permissions',
      resourceId: permission.id,
      details: {
        code: permission.code,
        resource: permission.resource,
        permissionAction: permission.action,
      },
    });

    return permission;
  }

  async delete(actor: PermissionActor, id: string) {
    const deleted = await this.permissionsRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Permissao nao encontrada.');
    }

    await this.auditService.log({
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'permissions.deleted',
      resource: 'permissions',
      resourceId: id,
    });

    return { success: true };
  }
}
