import { ConfigService } from '@nestjs/config';

import { AuditLogsRepository } from '../repositories/audit-logs.repository';
import { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository';
import { RetentionService } from './retention.service';

type ExportsServiceLike = {
  deleteExpiredExports(cutoffDate: Date): Promise<number>;
};

function createConfigService(overrides: Record<string, unknown> = {}): jest.Mocked<ConfigService> {
  return {
    get: jest.fn((key: string, defaultValue?: unknown) => {
      const defaults: Record<string, unknown> = {
        RETENTION_AUDIT_LOG_DAYS: 90,
        RETENTION_REFRESH_TOKEN_DAYS: 30,
        RETENTION_EXPORT_DAYS: 7,
        ...overrides,
      };
      return defaults[key] ?? defaultValue;
    }),
  } as unknown as jest.Mocked<ConfigService>;
}

describe('RetentionService', () => {
  let auditLogsRepository: jest.Mocked<AuditLogsRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let exportsService: jest.Mocked<ExportsServiceLike>;
  let service: RetentionService;

  beforeEach(() => {
    auditLogsRepository = {
      anonymizeOldLogs: jest.fn().mockResolvedValue(5),
    } as unknown as jest.Mocked<AuditLogsRepository>;

    refreshTokenRepository = {
      deleteExpiredRevoked: jest.fn().mockResolvedValue(3),
    } as unknown as jest.Mocked<RefreshTokenRepository>;

    exportsService = {
      deleteExpiredExports: jest.fn().mockResolvedValue(2),
    } as unknown as jest.Mocked<ExportsServiceLike>;

    service = new RetentionService(
      createConfigService(),
      auditLogsRepository,
      refreshTokenRepository,
      exportsService,
    );
  });

  describe('anonymizeOldAuditLogs', () => {
    it('deve anonimizar logs antigos chamando anonymizeOldLogs com cutoff correto', async () => {
      const result = await service.anonymizeOldAuditLogs();

      expect(auditLogsRepository.anonymizeOldLogs).toHaveBeenCalledTimes(1);
      const cutoff = auditLogsRepository.anonymizeOldLogs.mock.calls[0]![0] as Date;
      const expectedCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      expect(cutoff.getTime()).toBeCloseTo(expectedCutoff.getTime(), -1000);
      expect(result).toBe(5);
    });

    it('deve usar dias customizado quando informado', async () => {
      await service.anonymizeOldAuditLogs(180);

      const cutoff = auditLogsRepository.anonymizeOldLogs.mock.calls[0]![0] as Date;
      const expectedCutoff = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      expect(cutoff.getTime()).toBeCloseTo(expectedCutoff.getTime(), -1000);
    });
  });

  describe('deleteExpiredRefreshTokens', () => {
    it('deve remover tokens expirados revogados com cutoff de 30 dias', async () => {
      const result = await service.deleteExpiredRefreshTokens();

      expect(refreshTokenRepository.deleteExpiredRevoked).toHaveBeenCalledTimes(1);
      const cutoff = refreshTokenRepository.deleteExpiredRevoked.mock.calls[0]![0] as Date;
      const expectedCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      expect(cutoff.getTime()).toBeCloseTo(expectedCutoff.getTime(), -1000);
      expect(result).toBe(3);
    });
  });

  describe('deleteExpiredExports', () => {
    it('deve remover exports expirados com cutoff de 7 dias', async () => {
      const result = await service.deleteExpiredExports();

      expect(exportsService.deleteExpiredExports).toHaveBeenCalledTimes(1);
      const cutoff = exportsService.deleteExpiredExports.mock.calls[0]![0] as Date;
      const expectedCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      expect(cutoff.getTime()).toBeCloseTo(expectedCutoff.getTime(), -1000);
      expect(result).toBe(2);
    });
  });

  describe('runRetention', () => {
    it('deve executar todos os metodos e retornar resultado agregado', async () => {
      const result = await service.runRetention();

      expect(auditLogsRepository.anonymizeOldLogs).toHaveBeenCalledTimes(1);
      expect(refreshTokenRepository.deleteExpiredRevoked).toHaveBeenCalledTimes(1);
      expect(exportsService.deleteExpiredExports).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        anonymizedLogs: 5,
        deletedTokens: 3,
        deletedExports: 2,
      });
    });

    it('deve continuar executando mesmo se um metodo falhar', async () => {
      auditLogsRepository.anonymizeOldLogs.mockRejectedValueOnce(new Error('DB error'));

      const result = await service.runRetention();

      expect(result.anonymizedLogs).toBe(0);
      expect(result.deletedTokens).toBe(3);
      expect(result.deletedExports).toBe(2);
    });
  });

  describe('getRetentionConfig', () => {
    it('deve retornar configuracoes atuais de retencao', () => {
      const config = service.getRetentionConfig();

      expect(config).toEqual({
        auditLogDays: 90,
        refreshTokenDays: 30,
        exportDays: 7,
      });
    });

    it('deve usar valores customizados do ConfigService', () => {
      const customService = new RetentionService(
        createConfigService({
          RETENTION_AUDIT_LOG_DAYS: 365,
          RETENTION_REFRESH_TOKEN_DAYS: 60,
          RETENTION_EXPORT_DAYS: 14,
        }),
        auditLogsRepository,
        refreshTokenRepository,
        exportsService,
      );

      const config = customService.getRetentionConfig();

      expect(config).toEqual({
        auditLogDays: 365,
        refreshTokenDays: 60,
        exportDays: 14,
      });
    });
  });
});
