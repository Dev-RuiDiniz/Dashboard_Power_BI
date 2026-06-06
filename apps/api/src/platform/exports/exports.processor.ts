import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';

import { NotificationsService } from '../notifications/notifications.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { EXPORTS_QUEUE_NAME, ExportJobPayload } from './exports.queue';

@Injectable()
export class ExportsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExportsProcessor.name);
  private worker: Worker<ExportJobPayload> | null = null;
  private connection: IORedis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit(): void {
    if (this.configService.get<string>('EXPORT_WORKER_ENABLED', 'true') === 'false') {
      this.logger.log('Export worker desabilitado por configuração.');
      return;
    }

    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));

    try {
      this.connection = new IORedis({ host, port, maxRetriesPerRequest: null, lazyConnect: true });
      this.worker = new Worker<ExportJobPayload>(
        EXPORTS_QUEUE_NAME,
        async (job) => this.processJob(job),
        {
          connection: this.connection,
        },
      );

      this.worker.on('failed', (job, error) => {
        this.logger.error(`Export job ${job?.id} failed: ${error.message}`);
      });

      void this.connection.connect().then(() => {
        this.logger.log('Export worker iniciado.');
      });
    } catch (error) {
      this.logger.warn(
        `Export worker não iniciado: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.connection?.quit();
  }

  private async processJob(job: Job<ExportJobPayload>): Promise<void> {
    const { jobId, userId, reportId, exportFormat, parameters } = job.data;
    const storageDir = this.configService.get<string>(
      'EXPORT_STORAGE_DIR',
      join(process.cwd(), 'storage', 'exports'),
    );
    const publicBaseUrl = this.configService.get<string>(
      'EXPORT_PUBLIC_BASE_URL',
      'http://localhost:3001/exports/files',
    );

    await mkdir(storageDir, { recursive: true });

    if (this.supabaseService.isEnabled()) {
      await this.supabaseService
        .getClient()
        .from('api_export_jobs')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', jobId);
    }

    try {
      const content = this.buildExportContent(exportFormat, reportId, parameters);
      const extension = exportFormat === 'excel' ? 'csv' : exportFormat;
      const fileName = `${jobId}.${extension}`;
      const filePath = join(storageDir, fileName);

      await writeFile(filePath, content, 'utf8');

      const fileUrl = `${publicBaseUrl.replace(/\/$/, '')}/${fileName}`;
      const fileSizeBytes = Buffer.byteLength(content, 'utf8');
      const completedAt = new Date().toISOString();

      if (this.supabaseService.isEnabled()) {
        await this.supabaseService
          .getClient()
          .from('api_export_jobs')
          .update({
            status: 'completed',
            file_path: filePath,
            file_url: fileUrl,
            file_size_bytes: fileSizeBytes,
            completed_at: completedAt,
          })
          .eq('id', jobId);

        await this.notificationsService.createExportReadyNotification(userId, jobId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido na exportação.';

      if (this.supabaseService.isEnabled()) {
        await this.supabaseService
          .getClient()
          .from('api_export_jobs')
          .update({
            status: 'failed',
            error_message: message,
            completed_at: new Date().toISOString(),
          })
          .eq('id', jobId);
      }

      throw error;
    }
  }

  private buildExportContent(
    format: ExportJobPayload['exportFormat'],
    reportId?: string,
    parameters?: Record<string, unknown>,
  ): string {
    const rows = [
      { metric: 'Receita', value: 120000 },
      { metric: 'Margem', value: 0.32 },
      { metric: 'Leads', value: 430 },
    ];

    if (format === 'json') {
      return JSON.stringify({ reportId, parameters: parameters ?? {}, rows }, null, 2);
    }

    const header = 'metric,value';
    const body = rows.map((row) => `${row.metric},${row.value}`).join('\n');

    if (format === 'csv' || format === 'excel') {
      return `${header}\n${body}`;
    }

    return `Exportação ${format.toUpperCase()}\nRelatório: ${reportId ?? 'N/A'}\n\n${header}\n${body}`;
  }
}
