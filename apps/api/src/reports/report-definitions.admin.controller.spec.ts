import { ReportDefinitionsAdminController } from './report-definitions.admin.controller';
import { ReportDefinitionsService } from './report-definitions.service';

describe('ReportDefinitionsAdminController', () => {
  let controller: ReportDefinitionsAdminController;

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
    create: jest.fn(),
    list: jest.fn(),
    getById: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    validateSource: jest.fn(),
  } as unknown as jest.Mocked<ReportDefinitionsService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve delegar criação ao serviço', async () => {
    service.create.mockResolvedValue(report);
    controller = new ReportDefinitionsAdminController(service);

    await expect(controller.create(report)).resolves.toEqual(report);
    expect(service.create).toHaveBeenCalledWith(report);
  });

  it('deve listar catálogo administrativo', async () => {
    service.list.mockResolvedValue([report]);
    controller = new ReportDefinitionsAdminController(service);

    await expect(controller.list()).resolves.toEqual([report]);
  });

  it('deve buscar e atualizar por id', async () => {
    service.getById.mockResolvedValue(report);
    service.update.mockResolvedValue({ ...report, description: 'Nova descrição.' });
    controller = new ReportDefinitionsAdminController(service);

    await expect(controller.getById('report-1')).resolves.toEqual(report);
    await expect(
      controller.update('report-1', { description: 'Nova descrição.' }),
    ).resolves.toMatchObject({
      description: 'Nova descrição.',
    });
  });

  it('deve desativar relatório', async () => {
    service.deactivate.mockResolvedValue({ ...report, isActive: false });
    controller = new ReportDefinitionsAdminController(service);

    await expect(controller.deactivate('report-1')).resolves.toMatchObject({ isActive: false });
  });

  it('deve validar fonte SQL existente', async () => {
    service.validateSource.mockResolvedValue({ valid: true });
    controller = new ReportDefinitionsAdminController(service);

    await expect(
      controller.validateSource({ sourceType: 'view', sourceName: 'reports.vw_financeiro' }),
    ).resolves.toEqual({ valid: true });
    expect(service.validateSource).toHaveBeenCalledWith('view', 'reports.vw_financeiro');
  });

  it('deve retornar invalido para fonte SQL inexistente', async () => {
    service.validateSource.mockResolvedValue({ valid: false, message: 'Fonte não encontrada.' });
    controller = new ReportDefinitionsAdminController(service);

    await expect(
      controller.validateSource({ sourceType: 'view', sourceName: 'dbo.inexistente' }),
    ).resolves.toMatchObject({ valid: false });
  });
});
