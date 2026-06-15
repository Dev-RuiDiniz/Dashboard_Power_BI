import { Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { SupabaseService } from '../../supabase/supabase.service';
import {
  CreatePermissionInput,
  Permission,
  UpdatePermissionInput,
} from '../entities/permission.entity';

type ApiPermissionRow = {
  id: string;
  code: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

@Injectable()
export class PermissionsRepository {
  private readonly permissions = new Map<string, Permission>();

  constructor(@Optional() private readonly supabaseService?: SupabaseService) {}

  async findAll(): Promise<Permission[]> {
    if (this.useSupabase()) {
      const { data, error } = await this.supabaseService!.getClient()
        .from('api_permissions')
        .select('*');

      if (error) {
        throw error;
      }

      return (data as ApiPermissionRow[]).map((row) => this.rowToPermission(row));
    }

    return Array.from(this.permissions.values());
  }

  async findById(id: string): Promise<Permission | null> {
    if (this.useSupabase()) {
      const { data, error } = await this.supabaseService!.getClient()
        .from('api_permissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? this.rowToPermission(data as ApiPermissionRow) : null;
    }

    return this.permissions.get(id) ?? null;
  }

  async findByCode(code: string): Promise<Permission | null> {
    if (this.useSupabase()) {
      const { data, error } = await this.supabaseService!.getClient()
        .from('api_permissions')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? this.rowToPermission(data as ApiPermissionRow) : null;
    }

    return Array.from(this.permissions.values()).find((p) => p.code === code) ?? null;
  }

  async create(input: CreatePermissionInput): Promise<Permission> {
    const existing = await this.findByCode(input.code);

    if (existing) {
      throw new Error('Já existe uma permissão com este código.');
    }

    const now = new Date();
    const permission: Permission = {
      id: randomUUID(),
      ...input,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('api_permissions')
        .insert(this.permissionToRow(permission));

      if (error) {
        throw error;
      }

      return permission;
    }

    this.permissions.set(permission.id, permission);

    return permission;
  }

  async update(id: string, input: UpdatePermissionInput): Promise<Permission | null> {
    const current = await this.findById(id);

    if (!current) {
      return null;
    }

    if (input.code && input.code !== current.code) {
      const existing = await this.findByCode(input.code);

      if (existing && existing.id !== id) {
        throw new Error('Já existe uma permissão com este código.');
      }
    }

    const permission: Permission = {
      ...current,
      ...input,
      updatedAt: new Date(),
    };

    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('api_permissions')
        .update(this.permissionToRow(permission))
        .eq('id', id);

      if (error) {
        throw error;
      }

      return permission;
    }

    this.permissions.set(id, permission);

    return permission;
  }

  async delete(id: string): Promise<boolean> {
    if (this.useSupabase()) {
      const { error, count } = await this.supabaseService!.getClient()
        .from('api_permissions')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return (count ?? 0) > 0;
    }

    return this.permissions.delete(id);
  }

  private useSupabase(): boolean {
    return this.supabaseService?.isEnabled() ?? false;
  }

  private rowToPermission(row: ApiPermissionRow): Permission {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      resource: row.resource,
      action: row.action,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private permissionToRow(permission: Permission): ApiPermissionRow {
    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      resource: permission.resource,
      action: permission.action,
      is_active: permission.isActive,
      created_at: permission.createdAt.toISOString(),
      updated_at: permission.updatedAt.toISOString(),
    };
  }
}
