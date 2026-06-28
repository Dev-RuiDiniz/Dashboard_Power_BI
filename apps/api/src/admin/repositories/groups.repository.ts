import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

import { SectorCode, UserRole } from '../../auth/types/auth.types';

export type UserGroup = {
  id: string;
  name: string;
  description?: string;
  roles: UserRole[];
  sectors: SectorCode[];
  permissionIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateGroupInput = {
  name: string;
  description?: string;
  roles: UserRole[];
  sectors: SectorCode[];
  permissionIds?: string[];
};

export type UpdateGroupInput = Partial<CreateGroupInput> & {
  isActive?: boolean;
  permissionIds?: string[];
};

@Injectable()
export class GroupsRepository {
  private readonly groups = new Map<string, UserGroup>();

  constructor(private readonly configService: ConfigService = new ConfigService()) {
    this.seedDemoGroups();
  }

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
      throw new ConflictException('Ja existe um grupo com este nome.');
    }

    const now = new Date();
    const group: UserGroup = {
      id: randomUUID(),
      name: input.name.trim(),
      description: input.description?.trim(),
      roles: input.roles,
      sectors: input.sectors,
      permissionIds: input.permissionIds ?? [],
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
        throw new ConflictException('Ja existe um grupo com este nome.');
      }
    }

    const group: UserGroup = {
      ...current,
      ...input,
      name: input.name?.trim() ?? current.name,
      description: input.description?.trim() ?? current.description,
      permissionIds: input.permissionIds ?? current.permissionIds,
      updatedAt: new Date(),
    };

    this.groups.set(id, group);

    return group;
  }

  async delete(id: string): Promise<boolean> {
    return this.groups.delete(id);
  }

  private seedDemoGroups(): void {
    if (!isDemoMode(this.configService)) {
      return;
    }

    const now = new Date();
    const defaults: UserGroup[] = [
      {
        id: 'group-admin',
        name: 'Administradores',
        description: 'Grupo completo para demonstracao local.',
        roles: ['admin'],
        sectors: ['diretoria', 'financeiro', 'comercial', 'operacoes'],
        permissionIds: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'group-financeiro-viewer',
        name: 'Financeiro Viewer',
        description: 'Acesso de leitura ao setor financeiro.',
        roles: ['viewer'],
        sectors: ['financeiro'],
        permissionIds: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'group-comercial-viewer',
        name: 'Comercial Viewer',
        description: 'Acesso de leitura ao setor comercial.',
        roles: ['viewer'],
        sectors: ['comercial'],
        permissionIds: [],
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    for (const group of defaults) {
      this.groups.set(group.id, group);
    }
  }
}

function isDemoMode(configService: ConfigService): boolean {
  return (
    configService.get<string>('APP_MODE') === 'demo' ||
    configService.get<string>('DATA_MODE') === 'mock'
  );
}
