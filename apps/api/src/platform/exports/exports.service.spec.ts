import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    };
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
});
