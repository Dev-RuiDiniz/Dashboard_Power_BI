import { Injectable } from '@nestjs/common';

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
  constructor(private readonly supabaseService: SupabaseService) {}

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
}
