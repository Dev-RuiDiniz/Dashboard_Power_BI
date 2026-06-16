import { ForbiddenException } from '@nestjs/common';

import { DatabaseProviderService } from '../sql-server/database-provider.service';
import { SqlQueryService } from '../sql-server/sql-query.service';
import { ReportDefinitionsRepository } from './repositories/report-definitions.repository';
import { ReportAuthorizationService } from './report-authorization.service';
import { ReportDefinitionsService } from './report-definitions.service';
import { ReportsApiService } from './reports-api.service';

describe('ReportsApiService', () => {
  async function createService() {
    const repository = new ReportDefinitionsRepository();
    const sqlQueryService = {
      executeView: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]),
      executeStoredProcedure: jest.fn().mockResolvedValue([{ id: 10 }]),
    } as unknown as jest.Mocked<SqlQueryService>;
    const definitionsService = new ReportDefinitionsService(repository, sqlQueryService);
    const authorizationService = new ReportAuthorizationService();
    const databaseProviderService = {
      getProvider: jest.fn().mockReturnValue('sqlserver'),
    } as unknown as jest.Mocked<Pick<DatabaseProviderService, 'getProvider'>>;

    const service = new ReportsApiService(
      definitionsService,
      authorizationService,
      sqlQueryService,
      databaseProviderService as unknown as DatabaseProviderService,
    );

    const report = await definitionsService.create({
      name: 'Relatório Financeiro',
      description: 'Visão consolidada.',
      sector: 'financeiro',
      sourceType: 'view',
      sourceName: 'reports.vw_financeiro',
      parameters: [{ name: 'sectorId', type: 'string', required: true, maxLength: 80 }],
      requiredPermissions: ['reports:financeiro:read'],
    });

    return { service, sqlQueryService, report };
  }

  const user = {
    userId: 'user-1',
    roles: ['viewer'],
    sectors: ['financeiro'],
    permissions: ['reports:financeiro:read'],
  };

  it('deve listar relatórios autorizados com paginação sem expor sourceName', async () => {
    const { service } = await createService();

    const response = await service.listReports(
      { sector: 'financeiro', page: 1, pageSize: 10 },
      user,
    );

    expect(response.total).toBe(1);
    expect(response.items[0]).toMatchObject({ id: 'report-1', sector: 'financeiro' });
    expect(response.items[0]).not.toHaveProperty('sourceName');
  });

  it('deve retornar detalhe autorizado do relatório', async () => {
    const { service, report } = await createService();

    await expect(service.getReportById(report.id, user)).resolves.toMatchObject({
      id: report.id,
      name: report.name,
    });
  });

  it('deve negar acesso antes de executar query quando usuário não tem permissão', async () => {
    const { service, report, sqlQueryService } = await createService();

    await expect(
      service.queryReport(
        report.id,
        { filters: { sectorId: 'financeiro' } },
        { userId: 'user-2', roles: ['viewer'], sectors: ['financeiro'], permissions: [] },
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(sqlQueryService.executeView).not.toHaveBeenCalled();
  });

  it('deve validar filtros antes de executar query', async () => {
    const { service, report, sqlQueryService } = await createService();

    await expect(
      service.queryReport(report.id, { filters: { unknown: 'x', sectorId: 'financeiro' } }, user),
    ).rejects.toThrow();
    expect(sqlQueryService.executeView).not.toHaveBeenCalled();
  });

  it('deve executar query segura e paginar resultado em memória', async () => {
    const { service, report, sqlQueryService } = await createService();

    const response = await service.queryReport(
      report.id,
      { filters: { sectorId: 'financeiro' }, page: 2, pageSize: 2 },
      user,
    );

    expect(sqlQueryService.executeView).toHaveBeenCalledWith(
      {
        viewName: 'reports.vw_financeiro',
        filters: [
          {
            column: 'sectorId',
            name: 'sectorId',
            type: 'string',
            value: 'financeiro',
            required: true,
            maxLength: 80,
          },
        ],
      },
      'sqlserver',
    );
    expect(response).toEqual({ items: [{ id: 3 }], page: 2, pageSize: 2, total: 3, totalPages: 2 });
  });
});
