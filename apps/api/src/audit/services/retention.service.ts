import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

import { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository';
import { ExportsService } from '../../platform/exports/exports.service';
import { AuditLogsRepository } from '../repositories/audit-logs.repository';

export type RetentionResult = {
  anonymizedLogs: number;
  deletedTokens: number;
  deletedExports: number;
};

export type RetentionConfig = {
  auditLogDays: number;
  refreshTokenDays: number;
  exportDays: number;
};

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly auditLogsRepository: AuditLogsRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly exportsService: ExportsService,
  ) {}

  async anonymizeOldAuditLogs(days?: number): Promise<number> {
    const retentionDays = days ?? this.configService.get<number>('RETENTION_AUDIT_LOG_DAYS', 90);
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const count = await this.auditLogsRepository.anonymizeOldLogs(cutoff);
    this.logger.log(`anonymized_audit_logs count=${count} cutoff=${cutoff.toISOString()}`);
    return count;
  }

  async deleteExpiredRefreshTokens(days?: number): Promise<number> {
    const retentionDays =
      days ?? this.configService.get<number>('RETENTION_REFRESH_TOKEN_DAYS', 30);
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const count = await this.refreshTokenRepository.deleteExpiredRevoked(cutoff);
    this.logger.log(`deleted_expired_tokens count=${count} cutoff=${cutoff.toISOString()}`);
    return count;
  }

  async deleteExpiredExports(days?: number): Promise<number> {
    const retentionDays = days ?? this.configService.get<number>('RETENTION_EXPORT_DAYS', 7);
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const count = await this.exportsService.deleteExpiredExports(cutoff);
    this.logger.log(`deleted_expired_exports count=${count} cutoff=${cutoff.toISOString()}`);
    return count;
  }

  async runRetention(): Promise<RetentionResult> {
    this.logger.log('retention_job_started');

    let anonymizedLogs = 0;
    let deletedTokens = 0;
    let deletedExports = 0;

    try {
      anonymizedLogs = await this.anonymizeOldAuditLogs();
    } catch (error) {
      this.logger.error(`retention_audit_logs_failed: ${error}`);
    }

    try {
      deletedTokens = await this.deleteExpiredRefreshTokens();
    } catch (error) {
      this.logger.error(`retention_refresh_tokens_failed: ${error}`);
    }

    try {
      deletedExports = await this.deleteExpiredExports();
    } catch (error) {
      this.logger.error(`retention_exports_failed: ${error}`);
    }

    this.logger.log(
      `retention_job_completed anonymizedLogs=${anonymizedLogs} deletedTokens=${deletedTokens} deletedExports=${deletedExports}`,
    );

    return { anonymizedLogs, deletedTokens, deletedExports };
  }

  getRetentionConfig(): RetentionConfig {
    return {
      auditLogDays: this.configService.get<number>('RETENTION_AUDIT_LOG_DAYS', 90),
      refreshTokenDays: this.configService.get<number>('RETENTION_REFRESH_TOKEN_DAYS', 30),
      exportDays: this.configService.get<number>('RETENTION_EXPORT_DAYS', 7),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCron(): Promise<void> {
    this.logger.log('cron_retention_triggered');
    await this.runRetention();
  }
}
