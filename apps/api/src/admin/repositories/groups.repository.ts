import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { SectorCode, UserRole } from '../../auth/types/auth.types';

export type UserGroup = {
  id: string;
  name: string;
  description?: string;
  roles: UserRole[];
  sectors: SectorCode[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateGroupInput = {
  name: string;
  description?: string;
  roles: UserRole[];
  sectors: SectorCode[];
};

export type UpdateGroupInput = Partial<CreateGroupInput> & {
  isActive?: boolean;
};

@Injectable()
export class GroupsRepository {
  private readonly groups = new Map<string, UserGroup>();

  async findAll(): Promise<UserGroup[]> {
    return Array.from(this.groups.values());
  }

  async findById(id: string): Promise<UserGroup | null> {
    return this.groups.get(id) ?? null;
  }

  async findByName(name: string): Promise<UserGroup | null> {
    const normalized = name.trim().toLowerCase();
    return (
      Array.from(this.groups.values()).find((group) => group.name.toLowerCase() === normalized) ??
      null
    );
  }

  async create(input: CreateGroupInput): Promise<UserGroup> {
    const existing = await this.findByName(input.name);

    if (existing) {
      throw new ConflictException('Já existe um grupo com este nome.');
    }

    const now = new Date();
    const group: UserGroup = {
      id: randomUUID(),
      name: input.name.trim(),
      description: input.description?.trim(),
      roles: input.roles,
      sectors: input.sectors,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    this.groups.set(group.id, group);

    return group;
  }

  async update(id: string, input: UpdateGroupInput): Promise<UserGroup | null> {
    const current = await this.findById(id);

    if (!current) {
      return null;
    }

    if (input.name && input.name.trim().toLowerCase() !== current.name.toLowerCase()) {
      const existing = await this.findByName(input.name);

      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe um grupo com este nome.');
      }
    }

    const group: UserGroup = {
      ...current,
      ...input,
      name: input.name?.trim() ?? current.name,
      description: input.description?.trim() ?? current.description,
      updatedAt: new Date(),
    };

    this.groups.set(id, group);

    return group;
  }

  async delete(id: string): Promise<boolean> {
    return this.groups.delete(id);
  }
}
