import {
  buildReportFiltersQueryParams,
  reportFiltersSchema,
  toReportFiltersPayload,
} from './report-filters';

describe('reportFiltersSchema', () => {
  it('aceita filtros avancados validos e remove valores vazios', () => {
    const parsed = reportFiltersSchema.parse({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      category: 'dre',
      sector: 'financeiro',
      parameters: {
        competencia: '2026-05',
        somenteAtivos: true,
        limite: 10,
        vazio: '',
      },
    });

    expect(parsed).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      category: 'dre',
      sector: 'financeiro',
      parameters: {
        competencia: '2026-05',
        somenteAtivos: true,
        limite: 10,
      },
    });
  });

  it('rejeita intervalo de datas invalido', () => {
    const result = reportFiltersSchema.safeParse({
      startDate: '2026-06-01',
      endDate: '2026-05-01',
    });

    expect(result.success).toBe(false);
  });

  it('rejeita data fora do formato yyyy-mm-dd', () => {
    const result = reportFiltersSchema.safeParse({
      startDate: '01/05/2026',
    });

    expect(result.success).toBe(false);
  });

  it('normaliza payload antes de enviar para a api', () => {
    expect(
      toReportFiltersPayload {
        startDate: '2026-05-01',
        endDate: '',
        category: '  dre  ',
        sector: 'financeiro',
        parameters: {
          competencia: ' 2026-05 ',
          vazio: '',
        },
      }),
    ).toEqual({
      startDate: '2026-05-01',
      category: 'dre',
      sector: 'financeiro',
      parameters: {
        competencia: '2026-05',
      },
    });
  });

  it('monta query params com filtros e parametros dinamicos', () => {
    const params = buildReportFiltersQueryParams({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      category: 'dre',
      sector: 'financeiro',
      parameters: {
        competencia: '2026-05',
        ativo: true,
        limite: 10,
      },
    });

    expect(params.toString()).toBe(
      'startDate=2026-05-01&endDate=2026-05-31&category=dre&sector=financeiro&parameters%5Bcompetencia%5D=2026-05&parameters%5Bativo%5D=true&parameters%5Blimite%5D=10',
    );
  });
});
