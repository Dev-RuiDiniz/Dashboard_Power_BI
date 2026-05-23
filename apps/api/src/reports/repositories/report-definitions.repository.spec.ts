import { ReportDefinitionsRepository } from './report-definitions.repository';

describe('ReportDefinitionsRepository', () => {
  const createInput = {
    name: 'Relatório Financeiro',
    description: 'Visão consolidada.',
    sector: 'financeiro',
    sourceType: 'view' as const,
    sourceName: 'reports.vw_financeiro',
    parameters: [],
    requiredPermissions: ['reports:financeiro:read'],
    isActive: true,
  };

  it('deve criar, buscar e listar definições', async () => {
    const repository = new ReportDefinitionsRepository();

    const created = await repository.create(createInput);

    expect(created.id).toBe('report-1');
    await expect(repository.findById(created.id)).resolves.toEqual(created);
    await expect(repository.findAll()).resolves.toEqual([created]);
  });

  it('deve listar apenas relatórios ativos por setor', async () => {
    const repository = new ReportDefinitionsRepository();

    await repository.create(createInput);
    await repository.create({ ...createInput, name: 'Inativo', sourceName: 'reports.vw_inativo', isActive: false });
    await repository.create({ ...createInput, name: 'Comercial', sector: 'comercial', sourceName: 'reports.vw_comercial' });

    await expect(repository.findBySector('financeiro')).resolves.toHaveLength(1);
    await expect(repository.findBySector('financeiro', false)).resolves.toHaveLength(2);
  });

  it('deve atualizar parcialmente preservando dados existentes', async () => {
    const repository = new ReportDefinitionsRepository();
    const created = await repository.create(createInput);

    const updated = await repository.update(created.id, { description: 'Nova descrição.' });

    expect(updated).toMatchObject({
      id: created.id,
      name: createInput.name,
      description: 'Nova descrição.',
      sourceName: createInput.sourceName,
    });
  });

  it('deve desativar relatório sem remover fisicamente', async () => {
    const repository = new ReportDefinitionsRepository();
    const created = await repository.create(createInput);

    const deactivated = await repository.deactivate(created.id);

    expect(deactivated?.isActive).toBe(false);
    await expect(repository.findById(created.id)).resolves.toMatchObject({ isActive: false });
  });

  it('deve identificar duplicidade por fonte e setor', async () => {
    const repository = new ReportDefinitionsRepository();
    const created = await repository.create(createInput);

    await expect(repository.existsBySourceAndSector(createInput.sourceName, createInput.sector)).resolves.toBe(true);
    await expect(repository.existsBySourceAndSector(createInput.sourceName, createInput.sector, created.id)).resolves.toBe(
      false,
    );
  });
});
