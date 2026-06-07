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
});
