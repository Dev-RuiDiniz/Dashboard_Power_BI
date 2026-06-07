import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';

import { AuditService } from '../../audit/audit.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ExportJobRunnerService } from './export-job-runner.service';
import { EXPORTS_QUEUE_NAME, ExportJobPayload } from './exports.queue';

@Injectable()
export class ExportsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ExportsProcessor.name);
  private worker: Worker | null = null;
  private connection: IORedis | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly notificationsService: NotificationsService,
    private readonly exportJobRunnerService: ExportJobRunnerService,
    private readonly auditService: AuditService,
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
      this.worker = new Worker(EXPORTS_QUEUE_NAME, async (job) => this.processJob(job), {
        connection: this.connection as never,
      });

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
    const { jobId, userId, reportId, exportFormat, parameters, requestContext } = job.data;
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
      const builtFile = await this.exportJobRunnerService.run(job.data);
      const fileName = `${jobId}.${builtFile.extension}`;
      const filePath = join(storageDir, fileName);

      await writeFile(filePath, builtFile.buffer);

      const fileUrl = `${publicBaseUrl.replace(/\/$/, '')}/${fileName}`;
      const fileSizeBytes = builtFile.buffer.byteLength;
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

      await this.auditService.log({
        userId,
        userEmail: requestContext.email,
        action: 'export.completed',
        resource: 'exports',
        resourceId: jobId,
        details: {
          reportId,
          exportFormat,
          parameters: parameters ?? {},
          fileName,
          fileSizeBytes,
        },
      });
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

      await this.auditService.log({
        userId,
        userEmail: requestContext.email,
        action: 'export.failed',
        resource: 'exports',
        resourceId: jobId,
        details: {
          reportId,
          exportFormat,
          parameters: parameters ?? {},
          errorMessage: message,
        },
      });

      throw error;
    }
  }
}
