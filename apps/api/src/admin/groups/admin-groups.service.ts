import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsRepository, UserGroup } from '../repositories/groups.repository';

@Injectable()
export class AdminGroupsService {
  constructor(private readonly groupsRepository: GroupsRepository) {}

  async list(): Promise<UserGroup[]> {
    return this.groupsRepository.findAll();
  }

  async getById(id: string): Promise<UserGroup> {
    const group = await this.groupsRepository.findById(id);

    if (!group) {
      throw new NotFoundException('Grupo não encontrado.');
    }

    return group;
  }

  async create(dto: CreateGroupDto): Promise<UserGroup> {
    return this.groupsRepository.create(dto);
  }

  async update(id: string, dto: UpdateGroupDto): Promise<UserGroup> {
    const group = await this.groupsRepository.update(id, dto);

    if (!group) {
      throw new NotFoundException('Grupo não encontrado.');
    }

    return group;
  }

  async delete(id: string): Promise<{ success: true }> {
    const deleted = await this.groupsRepository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Grupo não encontrado.');
    }

    return { success: true };
  }
}
