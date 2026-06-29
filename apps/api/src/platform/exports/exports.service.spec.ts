import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'node:path';

import { ExportsService } from './exports.service';

describe('ExportsService', () => {
  function createService() {
    const insert = jest.fn().mockResolvedValue({ error: null });
    const from = jest.fn().mockReturnValue({ insert });
    const supabaseService = {
      isEnabled: () => true,
      getClient: () => ({ from }),
    };
    const reportsApiService = {
      getReportById: jest.fn().mockResolvedValue({
        id: 'report-1',
        name: 'Relatório Financeiro',
      }),
    };
    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'EXPORT_WORKER_ENABLED') return 'false';
        if (key === 'EXPORT_STORAGE_DIR') return './storage/exports';
        return defaultValue;
      }),
    };

    const service = new ExportsService(
      configService as unknown as ConfigService,
      supabaseService as never,
      reportsApiService as never,
    );

    return {
      service,
      insert,
      from,
      reportsApiService,
      supabaseService,
    };
  }

  function createServiceWithSupabaseFileQuery(filePath: string | null) {
    const maybeSingle = jest.fn().mockResolvedValue({
      data: filePath
        ? {
            file_path: filePath,
            status: 'completed',
            expires_at: new Date(Date.now() + 86400000).toISOString(),
          }
        : null,
      error: null,
    });
    const like = jest.fn().mockReturnValue({ maybeSingle });
    const eq = jest.fn().mockReturnValue({ like });
    const select = jest.fn().mockReturnValue({ eq });
    const from = jest.fn().mockReturnValue({ select });
    const supabaseService = {
      isEnabled: () => true,
      getClient: () => ({ from }),
    };
    const reportsApiService = {
      getReportById: jest.fn().mockResolvedValue({ id: 'report-1' }),
    };
    const configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === 'EXPORT_WORKER_ENABLED') return 'false';
        if (key === 'EXPORT_STORAGE_DIR') return './storage/exports';
        return defaultValue;
      }),
    };

    const service = new ExportsService(
      configService as unknown as ConfigService,
      supabaseService as never,
      reportsApiService as never,
    );

    return { service, from, maybeSingle };
  }

  it('rejeita criação de exportação sem reportId', async () => {
    const { service } = createService();

    await expect(
      service.createForUser(
        {
          sub: 'user-1',
          email: 'admin@example.com',
          roles: ['admin'],
          sectors: ['financeiro'],
        } as never,
        { exportFormat: 'pdf' },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('enfileira exportação com contexto autenticado do usuário', async () => {
    const { service, insert, reportsApiService } = createService();
    const add = jest.fn().mockResolvedValue(undefined);
    (service as unknown as { queue: { add: typeof add } | null }).queue = { add };

    await service.createForUser(
      {
        sub: 'user-1',
        email: 'admin@example.com',
        roles: ['admin'],
        sectors: ['financeiro'],
      } as never,
      {
        reportId: 'report-1',
        exportFormat: 'pdf',
        parameters: { ano: 2026 },
      },
    );

    expect(reportsApiService.getReportById).toHaveBeenCalledWith(
      'report-1',
      expect.objectContaining({ sub: 'user-1' }),
    );
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        report_id: 'report-1',
        export_format: 'pdf',
      }),
    );
    expect(add).toHaveBeenCalledWith(
      'process-export',
      expect.objectContaining({
        reportId: 'report-1',
        exportFormat: 'pdf',
        requestContext: expect.objectContaining({
          userId: 'user-1',
          email: 'admin@example.com',
          roles: ['admin'],
          sectors: ['financeiro'],
        }),
      }),
      expect.any(Object),
    );
  });

  describe('getFilePathForUser — validação de fileName', () => {
    const validFileName = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf';

    it('rejeita fileName com path traversal (..)', async () => {
      const { service } = createServiceWithSupabaseFileQuery(null);

      await expect(service.getFilePathForUser('user-1', '../../../etc/passwd.pdf')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejeita fileName com barra', async () => {
      const { service } = createServiceWithSupabaseFileQuery(null);

      await expect(service.getFilePathForUser('user-1', 'foo/bar.pdf')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejeita fileName com backslash', async () => {
      const { service } = createServiceWithSupabaseFileQuery(null);

      await expect(service.getFilePathForUser('user-1', 'foo\\bar.pdf')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejeita fileName que não é UUID válido', async () => {
      const { service } = createServiceWithSupabaseFileQuery(null);

      await expect(service.getFilePathForUser('user-1', 'not-a-uuid.pdf')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejeita fileName com extensão não permitida', async () => {
      const { service } = createServiceWithSupabaseFileQuery(null);

      await expect(
        service.getFilePathForUser('user-1', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890.exe'),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejeita file_path do banco fora do storageDir (path traversal)', async () => {
      const { service } = createServiceWithSupabaseFileQuery('/etc/passwd');

      await expect(service.getFilePathForUser('user-1', validFileName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('rejeita file_path do banco com .. no caminho', async () => {
      const maliciousPath = resolve('./storage/exports/../../../etc/passwd');
      const { service } = createServiceWithSupabaseFileQuery(maliciousPath);

      await expect(service.getFilePathForUser('user-1', validFileName)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('retorna path resolvido quando file_path está dentro do storageDir', async () => {
      const safePath = resolve('./storage/exports/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf');
      const { service } = createServiceWithSupabaseFileQuery(safePath);

      const result = await service.getFilePathForUser('user-1', validFileName);

      expect(result).toBe(safePath);
    });

    it('retorna NotFoundException quando arquivo não existe no banco', async () => {
      const { service } = createServiceWithSupabaseFileQuery(null);

      await expect(service.getFilePathForUser('user-1', validFileName)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
