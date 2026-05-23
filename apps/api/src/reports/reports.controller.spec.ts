import { ReportsApiService } from './reports-api.service';
import { ReportsController } from './reports.controller';

describe('ReportsController', () => {
  const response = {
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  };

  const service = {
    listReports: jest.fn(),
    getReportById: jest.fn(),
    queryReport: jest.fn(),
  } as unknown as jest.Mocked<ReportsApiService>;

  const user = {
    sub: 'user-1',
    email: 'user@example.com',
    roles: ['viewer'],
    sectors: ['financeiro'],
    permissions: ['reports:financeiro:read'],
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve delegar GET /reports ao ReportsApiService', async () => {
    service.listReports.mockResolvedValue(response);
    controller = new ReportsController(service);

    await expect(controller.listReports({ sector: 'financeiro' }, user)).resolves.toEqual(response);
    expect(service.listReports).toHaveBeenCalledWith({ sector: 'financeiro' }, user);
  });

  it('deve delegar GET /reports/:id ao ReportsApiService', async () => {
    service.getReportById.mockResolvedValue({
      id: 'report-1',
      name: 'Relatório Financeiro',
      description: 'Visão consolidada.',
      sector: 'financeiro',
      sourceType: 'view',
      parameters: [],
      requiredPermissions: [],
    });
    controller = new ReportsController(service);

    await expect(controller.getReportById('report-1', user)).resolves.toMatchObject({ id: 'report-1' });
    expect(service.getReportById).toHaveBeenCalledWith('report-1', user);
  });

  it('deve delegar POST /reports/:id/query ao ReportsApiService', async () => {
    service.queryReport.mockResolvedValue(response);
    controller = new ReportsController(service);
    const body = { filters: { sectorId: 'financeiro' }, page: 1, pageSize: 20 };

    await expect(controller.queryReport('report-1', body, user)).resolves.toEqual(response);
    expect(service.queryReport).toHaveBeenCalledWith('report-1', body, user);
  });
});
