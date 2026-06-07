import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { randomUUID } from 'node:crypto';

import { SupabaseService } from '../../supabase/supabase.service';
import { EXPORTS_QUEUE_NAME, ExportJobPayload } from './exports.queue';

export type ExportJobRecord = {
  id: string;
  report_id: string | null;
  export_format: 'pdf' | 'excel' | 'csv' | 'json';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_url: string | null;
  file_size_bytes: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
};

export type CreateExportInput = {
  reportId?: string;
  exportFormat: ExportJobRecord['export_format'];
  parameters?: Record<string, unknown>;
};

@Injectable()
export class ExportsService {
  private queue: Queue | null = null;
  private connection: IORedis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.initQueue();
  }

  async listForUser(userId: string): Promise<ExportJobRecord[]> {
    if (!this.supabaseService.isEnabled()) {
      return [];
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('api_export_jobs')
      .select(
        'id, report_id, export_format, status, file_url, file_size_bytes, error_message, created_at, completed_at, expires_at',
      )
      .eq('api_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return (data ?? []) as ExportJobRecord[];
  }

  async createForUser(userId: string, input: CreateExportInput): Promise<ExportJobRecord> {
    const jobId = randomUUID();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const record: ExportJobRecord = {
      id: jobId,
      report_id: input.reportId ?? null,
      export_format: input.exportFormat,
      status: 'pending',
      file_url: null,
      file_size_bytes: null,
      error_message: null,
      created_at: now,
      completed_at: null,
      expires_at: expiresAt,
    };

    if (this.supabaseService.isEnabled()) {
      const { error } = await this.supabaseService
        .getClient()
        .from('api_export_jobs')
        .insert({
          id: jobId,
          api_user_id: userId,
          report_id: input.reportId ?? null,
          export_format: input.exportFormat,
          parameters: input.parameters ?? null,
          status: 'pending',
          created_at: now,
          expires_at: expiresAt,
        });

      if (error) {
        throw error;
      }
    }

    if (this.queue) {
      await this.queue.add(
        'process-export',
        {
          jobId,
          userId,
          reportId: input.reportId,
          exportFormat: input.exportFormat,
          parameters: input.parameters,
        },
        { removeOnComplete: 100, removeOnFail: 100 },
      );
    }

    return record;
  }

  async getFilePathForUser(userId: string, fileName: string): Promise<string> {
    if (!this.supabaseService.isEnabled()) {
      throw new NotFoundException('Arquivo não encontrado.');
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('api_export_jobs')
      .select('file_path, status, expires_at')
      .eq('api_user_id', userId)
      .like('file_path', `%${fileName}`)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data?.file_path || data.status !== 'completed') {
      throw new NotFoundException('Arquivo não encontrado.');
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      throw new NotFoundException('Arquivo expirado.');
    }

    return data.file_path;
  }

  private initQueue(): void {
    if (this.configService.get<string>('EXPORT_WORKER_ENABLED', 'true') === 'false') {
      return;
    }

    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));

    try {
      this.connection = new IORedis({ host, port, maxRetriesPerRequest: null, lazyConnect: true });
      this.queue = new Queue(EXPORTS_QUEUE_NAME, { connection: this.connection as never });
    } catch {
      this.queue = null;
    }
  }
}
