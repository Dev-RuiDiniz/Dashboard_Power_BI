import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditService } from '../../audit/audit.service';
import { SupabaseService } from '../../supabase/supabase.service';

export type SystemSetting = {
  id: string;
  setting_key: string;
  setting_value: unknown;
  description: string | null;
  is_sensitive: boolean;
  updated_at: string;
};

@Injectable()
export class SettingsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async listSettings(): Promise<SystemSetting[]> {
    if (!this.supabaseService.isEnabled()) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('system_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      throw error;
    }

    return (data ?? []) as SystemSetting[];
  }

  async updateSetting(
    actor: { userId: string; userEmail: string },
    settingKey: string,
    settingValue: unknown,
  ): Promise<SystemSetting> {
    if (!this.supabaseService.isEnabled()) {
      throw new NotFoundException('Persistencia de configuracoes indisponivel.');
    }

    const updateQuery = this.supabaseService
      .getClient()
      .from('system_settings')
      .update({
        setting_value: settingValue,
      })
      .eq('setting_key', settingKey);

    const updateQueryWithSelect = updateQuery as unknown as {
      select?: (columns: string) => { single: () => Promise<{ data: unknown; error: unknown }> };
    };

    const { data, error } =
      typeof updateQueryWithSelect.select === 'function'
        ? await updateQueryWithSelect.select('*').single()
        : await updateQuery;

    if (error) {
      throw error;
    }

    const updated = data as SystemSetting | null;

    if (!updated) {
      throw new NotFoundException('Configuracao nao encontrada.');
    }

    await this.auditService.log({
      userId: actor.userId,
      userEmail: actor.userEmail,
      action: 'settings.updated',
      resource: 'system_settings',
      resourceId: settingKey,
      details: {
        settingKey,
        isSensitive: updated.is_sensitive,
      },
    });

    return updated;
  }
}
