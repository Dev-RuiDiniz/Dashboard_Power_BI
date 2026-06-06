import { Injectable, NotFoundException } from '@nestjs/common';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsRepository } from './repositories/permissions.repository';

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}

  async list() {
    return this.permissionsRepository.findAll();
  }

  async getById(id: string) {
    const permission = await this.permissionsRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada.');
    }

    return permission;
  }

  async create(dto: CreatePermissionDto) {
    return this.permissionsRepository.create(dto);
  }

  async update(id: string, dto: UpdatePermissionDto) {
    const permission = await this.permissionsRepository.update(id, dto);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada.');
    }

    return permission;
  }

  async delete(id: string) {
    const deleted = await this.permissionsRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Permissão não encontrada.');
    }

    return { success: true };
  }
}
