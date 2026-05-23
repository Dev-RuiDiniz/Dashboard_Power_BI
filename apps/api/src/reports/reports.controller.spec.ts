import { ReportDefinitionsService } from './report-definitions.service';
import { ReportsController } from './reports.controller';

describe('ReportsController', () => {
  const report = {
    id: 'report-1',
    name: 'Relatório Financeiro',
    description: 'Visão consolidada.',
    sector: 'financeiro',
    sourceType: 'view' as const,
    sourceName: 'reports.vw_financeiro',
    parameters: [],
    requiredPermissions: ['reports:financeiro:read'],
    isActive: true,
    createdAt: '2026-05-23T00:00:00.000Z',
    updatedAt: '2026-05-23T00:00:00.000Z',
  };

  const service = {
    listBySector: jest.fn(),
  } as unknown as jest.Mocked<ReportDefinitionsService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve delegar listagem por setor ao serviço', async () => {
    service.listBySector.mockResolvedValue([report]);
    const controller = new ReportsController(service);

    await expect(controller.listBySector('financeiro')).resolves.toEqual([report]);
    expect(service.listBySector).toHaveBeenCalledWith('financeiro');
  });
});
