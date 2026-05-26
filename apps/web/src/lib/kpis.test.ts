import {
  aggregateKpisBySector,
  calculateKpiDelta,
  formatKpiValue,
  getKpiTrend,
  summarizeKpis,
} from './kpis';

describe('kpis', () => {
  it('calcula delta percentual entre valor atual e anterior', () => {
    expect(calculateKpiDelta(120, 100)).toBe(20);
    expect(calculateKpiDelta(80, 100)).toBe(-20);
    expect(calculateKpiDelta(100, 100)).toBe(0);
  });

  it('trata valor anterior igual a zero sem quebrar', () => {
    expect(calculateKpiDelta(100, 0)).toBe(100);
    expect(calculateKpiDelta(0, 0)).toBe(0);
  });

  it('classifica tendencias positiva, negativa e neutra', () => {
    expect(getKpiTrend(8)).toBe('positive');
    expect(getKpiTrend(-3)).toBe('negative');
    expect(getKpiTrend(0)).toBe('neutral');
  });

  it('agrega kpis por setor', () => {
    const sectors = aggregateKpisBySector([
      { id: 'receita', title: 'Receita', sector: 'Financeiro', value: 120000, previousValue: 100000, unit: 'currency' },
      { id: 'margem', title: 'Margem', sector: 'Financeiro', value: 32, previousValue: 30, unit: 'percent' },
      { id: 'leads', title: 'Leads', sector: 'Comercial', value: 430, previousValue: 400, unit: 'number' },
    ]);

    expect(sectors).toEqual([
      { sector: 'Financeiro', total: 2, averageDelta: 13.33 },
      { sector: 'Comercial', total: 1, averageDelta: 7.5 },
    ]);
  });

  it('formata valores por unidade', () => {
    expect(formatKpiValue({ value: 1250, unit: 'number' })).toBe('1.250');
    expect(formatKpiValue({ value: 0.82, unit: 'percent' })).toBe('82%');
    expect(formatKpiValue({ value: 1200, unit: 'currency' })).toBe('R$ 1.200,00');
  });

  it('resume total de kpis, setores e media de delta', () => {
    const summary = summarizeKpis([
      { id: 'receita', title: 'Receita', sector: 'Financeiro', value: 120000, previousValue: 100000, unit: 'currency' },
      { id: 'leads', title: 'Leads', sector: 'Comercial', value: 430, previousValue: 400, unit: 'number' },
    ]);

    expect(summary).toEqual({
      totalKpis: 2,
      totalSectors: 2,
      averageDelta: 13.75,
    });
  });
});
