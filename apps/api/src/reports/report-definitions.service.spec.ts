import { ConflictException, NotFoundException } from '@nestjs/common';

import { ReportDefinitionsRepository } from './repositories/report-definitions.repository';
import { ReportDefinitionsService } from './report-definitions.service';

describe('ReportDefinitionsService', () => {
  const createInput = {
    name: 'Relatório Financeiro',
    description: 'Visão consolidada.',
    sector: 'Financeiro',
    sourceType: 'view' as const,
    sourceName: 'reports.vw_financeiro',
    parameters: [],
    requiredPermissions: ['reports:financeiro:read'],
  };

  function createService() {
    const repository = new ReportDefinitionsRepository();

    return {
      repository,
      service: new ReportDefinitionsService(repository),
    };
  }

  it('deve criar definição validada e normalizada', async () => {
    const { service } = createService();

    await expect(service.create(createInput)).resolves.toMatchObject({
      id: 'report-1',
      sector: 'financeiro',
      isActive: true,
    });
  });

  it('deve impedir duplicidade por fonte SQL e setor', async () => {
    const { service } = createService();

    await service.create(createInput);

    await expect(service.create(createInput)).rejects.toThrow(ConflictException);
  });

  it('deve converter conflito de unicidade do Supabase em erro controlado', async () => {
    const repository = {
      existsBySourceAndSector: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockRejectedValue({
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      }),
    };
    const service = new ReportDefinitionsService(repository as never);

    await expect(service.create(createInput)).rejects.toThrow(ConflictException);
  });

  it('deve listar somente relatórios ativos por setor', async () => {
    const { service } = createService();

    await service.create(createInput);
    const inactive = await service.create({
      ...createInput,
      name: 'Inativo',
      sourceName: 'reports.vw_financeiro_inativo',
    });
    await service.deactivate(inactive.id);
    await service.create({
      ...createInput,
      name: 'Comercial',
      sector: 'comercial',
      sourceName: 'reports.vw_comercial',
    });

    await expect(service.listBySector(' Financeiro ')).resolves.toHaveLength(1);
  });

  it('deve atualizar parcialmente mantendo definição válida', async () => {
    const { service } = createService();
    const created = await service.create(createInput);

    const updated = await service.update(created.id, { description: 'Nova descrição.' });

    expect(updated).toMatchObject({
      id: created.id,
      name: createInput.name,
      description: 'Nova descrição.',
      sector: 'financeiro',
    });
  });

  it('deve retornar erro controlado quando relatório não existir', async () => {
    const { service } = createService();

    await expect(service.getById('report-inexistente')).rejects.toThrow(NotFoundException);
    await expect(service.update('report-inexistente', { name: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
