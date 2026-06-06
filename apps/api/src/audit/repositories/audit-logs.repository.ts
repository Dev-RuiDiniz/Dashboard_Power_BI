import { Injectable, Optional } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import { SupabaseService } from '../../supabase/supabase.service';
import { AuditLog, CreateAuditLogInput, AuditLogFilter } from '../entities/audit-log.entity';

type ApiAuditLogRow = {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

@Injectable()
export class AuditLogsRepository {
  constructor(@Optional() private readonly supabaseService?: SupabaseService) {}

  async create(input: CreateAuditLogInput): Promise<AuditLog> {
    const now = new Date();
    const auditLog: AuditLog = {
      id: randomUUID(),
      ...input,
      createdAt: now,
    };

    if (this.useSupabase()) {
      const { error } = await this.supabaseService!.getClient()
        .from('api_audit_logs')
        .insert(this.logToRow(auditLog));

      if (error) {
        throw error;
      }

      return auditLog;
    }

    // In-memory fallback for development
    console.log('[Audit Log]', auditLog);
    return auditLog;
  }

  async findAll(filter?: AuditLogFilter, limit = 100): Promise<AuditLog[]> {
    if (this.useSupabase()) {
      let query = this.supabaseService!.getClient()
        .from('api_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filter?.userId) {
        query = query.eq('user_id', filter.userId);
      }
      if (filter?.action) {
        query = query.eq('action', filter.action);
      }
      if (filter?.resource) {
        query = query.eq('resource', filter.resource);
      }
      if (filter?.resourceId) {
        query = query.eq('resource_id', filter.resourceId);
      }
      if (filter?.startDate) {
        query = query.gte('created_at', filter.startDate.toISOString());
      }
      if (filter?.endDate) {
        query = query.lte('created_at', filter.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data as ApiAuditLogRow[]).map((row) => this.rowToLog(row));
    }

    return [];
  }

  async findById(id: string): Promise<AuditLog | null> {
    if (this.useSupabase()) {
      const { data, error } = await this.supabaseService!.getClient()
        .from('api_audit_logs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? this.rowToLog(data as ApiAuditLogRow) : null;
    }

    return null;
  }

  private useSupabase(): boolean {
    return this.supabaseService?.isEnabled() ?? false;
  }

  private rowToLog(row: ApiAuditLogRow): AuditLog {
    return {
      id: row.id,
      userId: row.user_id,
      userEmail: row.user_email,
      action: row.action,
      resource: row.resource,
      resourceId: row.resource_id ?? undefined,
      details: row.details ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      userAgent: row.userAgent ?? undefined,
      createdAt: new Date(row.created_at),
    };
  }

  private logToRow(log: AuditLog): ApiAuditLogRow {
    return {
      id: log.id,
      user_id: log.userId,
      user_email: log.userEmail,
      action: log.action,
      resource: log.resource,
      resource_id: log.resourceId ?? null,
      details: log.details ?? null,
      ip_address: log.ipAddress ?? null,
      user_agent: log.userAgent ?? null,
      created_at: log.createdAt.toISOString(),
    };
  }
}
