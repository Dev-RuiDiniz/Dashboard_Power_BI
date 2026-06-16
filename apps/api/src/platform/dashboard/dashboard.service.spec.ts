import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('monta payload consolidado para a home de BI', async () => {
    const service = new DashboardService({} as never, {} as never);

    const home = await service.getHome();

    expect(home.summary).toEqual({
      totalKpis: 12,
      totalSectors: 3,
      averageDelta: expect.any(Number),
    });
    expect(home.kpis).toHaveLength(12);
    expect(home.businessAreas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ businessArea: 'producao', label: 'Producao', total: 5 }),
        expect.objectContaining({ businessArea: 'comercial', label: 'Comercial', total: 4 }),
        expect.objectContaining({ businessArea: 'algodoeira', label: 'Algodoeira', total: 3 }),
      ]),
    );
    expect(home.charts.sectorDistribution).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sector: 'Producao', total: 5 }),
        expect.objectContaining({ sector: 'Comercial', total: 4 }),
        expect.objectContaining({ sector: 'Algodoeira', total: 3 }),
      ]),
    );
    expect(home.charts.kpiPerformance).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'producao-plantio-area',
          title: 'Area plantada',
          businessArea: 'producao',
        }),
      ]),
    );
    expect(home.availableDrilldowns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kpiId: 'comercial-contratos', dimension: 'businessArea' }),
      ]),
    );
  });

  it('retorna drilldown tabular de um KPI', async () => {
    const service = new DashboardService({} as never, {} as never);

    const drilldown = await service.getKpiDrilldown('comercial-contratos');

    expect(drilldown.kpiId).toBe('comercial-contratos');
    expect(drilldown.dimension).toBe('businessArea');
    expect(drilldown.series).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'Atual', value: expect.any(Number) }),
        expect.objectContaining({ label: 'Anterior', value: expect.any(Number) }),
      ]),
    );
    expect(drilldown.rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ period: expect.any(String), value: expect.any(Number) }),
      ]),
    );
  });

  it('retorna historico com periodos para KPI', async () => {
    const service = new DashboardService({} as never, {} as never);

    const history = await service.getKpiHistory('algodoeira-fardos');

    expect(history.kpiId).toBe('algodoeira-fardos');
    expect(history.granularity).toBe('monthly');
    expect(history.rangeMonths).toBe(12);
    expect(history.periods.length).toBeGreaterThan(0);
    expect(history.periods.length).toBeLessThanOrEqual(12);
    expect(history.periods[0]).toEqual(
      expect.objectContaining({
        period: expect.any(String),
        value: expect.any(Number),
        previousValue: expect.any(Number),
        delta: expect.any(Number),
      }),
    );
  });

  it('retorna comparativo anual para KPI comercial', async () => {
    const service = new DashboardService({} as never, {} as never);

    const history = await service.getKpiHistory('comercial-quantidade-entregue');

    expect(history.kpiId).toBe('comercial-quantidade-entregue');
    expect(history.granularity).toBe('annual-comparative');
    expect(history.rangeMonths).toBe(12);
    expect(history.periods).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          period: expect.stringMatching(/^\d{4}$/),
          value: expect.any(Number),
          previousValue: expect.any(Number),
          delta: expect.any(Number),
        }),
      ]),
    );
  });
});
