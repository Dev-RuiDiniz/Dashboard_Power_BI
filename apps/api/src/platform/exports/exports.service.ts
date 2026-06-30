import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { randomUUID } from 'node:crypto';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, relative, dirname, join } from 'node:path';

import { AuthenticatedRequestUser } from '../../auth/types/auth.types';
import { ReportsApiService } from '../../reports/reports-api.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { EXPORTS_QUEUE_NAME } from './exports.queue';

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
  private static readonly SAFE_FILE_NAME = /^[a-f0-9-]{36}\.(pdf|excel|csv|json)$/i;
  private queue: Queue | null = null;
  private connection: IORedis | null = null;
  private memoryExports = new Map<string, ExportJobRecord[]>();

  private validateFileName(fileName: string): void {
    if (
      !ExportsService.SAFE_FILE_NAME.test(fileName) ||
      fileName.includes('..') ||
      fileName.includes('/') ||
      fileName.includes('\\')
    ) {
      throw new BadRequestException('Nome de arquivo inválido.');
    }
  }

  private resolveSafeFilePath(filePath: string): string {
    const storageDir = resolve(
      this.configService.get<string>('EXPORT_STORAGE_DIR', './storage/exports'),
    );
    const resolvedPath = resolve(filePath);
    const relativePath = relative(storageDir, resolvedPath);

    if (relativePath.startsWith('..') || relativePath.includes('..') || relativePath === '') {
      throw new BadRequestException('Caminho de arquivo inválido.');
    }

    return resolvedPath;
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
    private readonly reportsApiService: ReportsApiService,
  ) {
    this.initQueue();
  }

  private useMemory(): boolean {
    return !this.supabaseService.isEnabled();
  }

  async markJobAsFailed(jobId: string, userId: string, errorMessage: string): Promise<void> {
    if (this.useMemory()) {
      const updated = this.getUserExports(userId).map((r) =>
        r.id === jobId
          ? {
              ...r,
              status: 'failed' as const,
              error_message: errorMessage,
              completed_at: new Date().toISOString(),
            }
          : r,
      );
      this.setUserExports(userId, updated);
    }
  }

  private getUserExports(userId: string): ExportJobRecord[] {
    return this.memoryExports.get(userId) ?? [];
  }

  private setUserExports(userId: string, exports: ExportJobRecord[]): void {
    this.memoryExports.set(userId, exports);
  }

  async listForUser(userId: string): Promise<ExportJobRecord[]> {
    if (this.useMemory()) {
      return this.getUserExports(userId);
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

  async createForUser(
    user: AuthenticatedRequestUser & { permissions?: string[] },
    input: CreateExportInput,
  ): Promise<ExportJobRecord> {
    if (!input.reportId) {
      throw new BadRequestException('reportId é obrigatório para criar exportações.');
    }

    await this.reportsApiService.getReportById(input.reportId, user);

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
          api_user_id: user.sub,
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

    if (this.useMemory()) {
      const current = this.getUserExports(user.sub);
      this.setUserExports(user.sub, [record, ...current]);
      // Simulate processing completion after 2 seconds
      setTimeout(() => {
        const updated = this.getUserExports(user.sub).map((r) =>
          r.id === jobId
            ? {
                ...r,
                status: 'completed' as const,
                file_url: `/exports/files/${jobId}.${input.exportFormat}`,
                file_size_bytes: 1024,
                completed_at: new Date().toISOString(),
              }
            : r,
        );
        this.setUserExports(user.sub, updated);
      }, 2000);
    }

    if (this.queue) {
      await this.queue.add(
        'process-export',
        {
          jobId,
          userId: user.sub,
          reportId: input.reportId,
          exportFormat: input.exportFormat,
          parameters: input.parameters,
          requestContext: {
            userId: user.sub,
            email: user.email,
            roles: [...user.roles],
            sectors: [...user.sectors],
            permissions: [...(user.permissions ?? [])],
          },
        },
        { removeOnComplete: 100, removeOnFail: 100 },
      );
    }

    return record;
  }

  async getFilePathForUser(userId: string, fileName: string): Promise<string> {
    this.validateFileName(fileName);

    if (this.useMemory()) {
      const jobs = this.getUserExports(userId);
      const job = jobs.find((j) => j.file_url?.includes(fileName));
      if (!job || job.status !== 'completed') {
        throw new NotFoundException('Arquivo não encontrado.');
      }
      if (new Date(job.expires_at) < new Date()) {
        throw new NotFoundException('Arquivo expirado.');
      }
      return this.ensureMockFile(fileName);
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

    return this.resolveSafeFilePath(data.file_path);
  }

  async deleteExpiredExports(cutoffDate: Date): Promise<number> {
    if (this.supabaseService.isEnabled()) {
      const { count, error } = await this.supabaseService
        .getClient()
        .from('api_export_jobs')
        .delete()
        .lt('expires_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      return count ?? 0;
    }

    return 0;
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

  private ensureMockFile(fileName: string): string {
    const storageDir = resolve(
      this.configService.get<string>('EXPORT_STORAGE_DIR', './storage/exports'),
    );
    const filePath = join(storageDir, fileName);

    if (!existsSync(filePath)) {
      mkdirSync(dirname(filePath), { recursive: true });
      const ext = fileName.split('.').pop()?.toLowerCase();
      const content = this.buildMockContent(ext ?? 'csv');
      writeFileSync(filePath, content, 'utf8');
    }

    return filePath;
  }

  private buildMockContent(ext: string): string {
    switch (ext) {
      case 'json':
        return JSON.stringify({
          message: 'Mock export file',
          generatedAt: new Date().toISOString(),
        });
      case 'csv':
        return 'id,nome,valor\n1,Mock,100\n2,Mock,200\n';
      case 'pdf':
        return '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n0\n%%EOF';
      default:
        return 'Mock export file';
    }
  }
}
