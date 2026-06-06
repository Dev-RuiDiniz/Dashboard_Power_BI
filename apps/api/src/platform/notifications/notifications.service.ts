import { Injectable, NotFoundException } from '@nestjs/common';

import { SupabaseService } from '../../supabase/supabase.service';

export type ApiNotification = {
  id: string;
  notification_type: 'report_available' | 'access_granted' | 'export_ready' | 'alert';
  title: string;
  message: string | null;
  related_resource_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listForUser(userId: string): Promise<ApiNotification[]> {
    if (!this.supabaseService.isEnabled()) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('api_notifications')
      .select('*')
      .eq('api_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return (data ?? []) as ApiNotification[];
  }

  async markAsRead(userId: string, id: string): Promise<ApiNotification> {
    if (!this.supabaseService.isEnabled()) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    const readAt = new Date().toISOString();
    const { data, error } = await this.supabaseService
      .getClient()
      .from('api_notifications')
      .update({ is_read: true, read_at: readAt })
      .eq('id', id)
      .eq('api_user_id', userId)
      .select('*')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    return data as ApiNotification;
  }

  async markAllAsRead(userId: string): Promise<{ updated: number }> {
    if (!this.supabaseService.isEnabled()) {
      return { updated: 0 };
    }

    const readAt = new Date().toISOString();
    const { data, error } = await this.supabaseService
      .getClient()
      .from('api_notifications')
      .update({ is_read: true, read_at: readAt })
      .eq('api_user_id', userId)
      .eq('is_read', false)
      .select('id');

    if (error) {
      throw error;
    }

    return { updated: data?.length ?? 0 };
  }

  async createExportReadyNotification(userId: string, exportJobId: string): Promise<void> {
    if (!this.supabaseService.isEnabled()) {
      return;
    }

    await this.supabaseService.getClient().from('api_notifications').insert({
      api_user_id: userId,
      notification_type: 'export_ready',
      title: 'Exportação concluída',
      message: 'Sua exportação está pronta para download.',
      related_resource_id: exportJobId,
    });
  }
}
