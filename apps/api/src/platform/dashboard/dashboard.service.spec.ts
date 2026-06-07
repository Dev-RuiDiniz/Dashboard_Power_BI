import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('monta payload consolidado para a home de BI', async () => {
    const service = new DashboardService({
      isEnabled: () => false,
    } as never);

    const home = await service.getHome();

    expect(home.summary).toEqual({
      totalKpis: 3,
      totalSectors: 2,
      averageDelta: expect.any(Number),
    });
    expect(home.kpis).toHaveLength(3);
    expect(home.sectorSummaries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sector: 'Financeiro', total: 2 }),
        expect.objectContaining({ sector: 'Comercial', total: 1 }),
      ]),
    );
    expect(home.charts.sectorDistribution).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sector: 'Financeiro', total: 2 }),
        expect.objectContaining({ sector: 'Comercial', total: 1 }),
      ]),
    );
    expect(home.charts.kpiPerformance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'receita-mensal', title: 'Receita mensal' }),
      ]),
    );
    expect(home.availableDrilldowns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kpiId: 'receita-mensal', dimension: 'sector' }),
      ]),
    );
  });

  it('retorna drilldown tabular de um KPI', async () => {
    const service = new DashboardService({
      isEnabled: () => false,
    } as never);

    const drilldown = await service.getKpiDrilldown('receita-mensal');

    expect(drilldown.kpiId).toBe('receita-mensal');
    expect(drilldown.dimension).toBe('sector');
    expect(drilldown.series).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Atual', value: 120000 }),
        expect.objectContaining({ label: 'Anterior', value: 100000 }),
      ]),
    );
    expect(drilldown.rows).toEqual(
      expect.arrayContaining([expect.objectContaining({ period: 'Atual', value: 120000 })]),
    );
  });
});
