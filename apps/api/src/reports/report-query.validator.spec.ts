import { ReportDefinition } from './entities/report-definition.entity';
import {
  normalizeListReportsQuery,
  normalizePagination,
  ReportQueryValidationError,
  validateReportQuery,
} from './report-query.validator';

const definition: ReportDefinition = {
  id: 'report-1',
  name: 'Relatório Financeiro',
  description: 'Visão consolidada.',
  sector: 'financeiro',
  sourceType: 'view',
  sourceName: 'reports.vw_financeiro',
  parameters: [
    { name: 'startDate', type: 'date', required: true },
    { name: 'sectorId', type: 'string', required: false, maxLength: 80 },
  ],
  requiredPermissions: ['reports:financeiro:read'],
  isActive: true,
  createdAt: '2026-05-23T00:00:00.000Z',
  updatedAt: '2026-05-23T00:00:00.000Z',
};

describe('report-query.validator', () => {
  it('deve aplicar paginação padrão e normalizar setor', () => {
    expect(normalizeListReportsQuery({ sector: ' Financeiro ' })).toEqual({
      sector: 'financeiro',
      pagination: { page: 1, pageSize: 20, offset: 0, limit: 20 },
    });
  });

  it('deve rejeitar paginação inválida', () => {
    expect(() => normalizePagination({ page: 0 })).toThrow(ReportQueryValidationError);
    expect(() => normalizePagination({ pageSize: 101 })).toThrow(ReportQueryValidationError);
    expect(() => normalizePagination({ page: 'abc' })).toThrow(ReportQueryValidationError);
  });

  it('deve validar filtros contra parâmetros declarados no catálogo', () => {
    const query = validateReportQuery(definition, {
      filters: {
        startDate: '2026-05-01',
        sectorId: 'financeiro',
      },
      page: 2,
      pageSize: 10,
    });

    expect(query.pagination).toEqual({ page: 2, pageSize: 10, offset: 10, limit: 10 });
    expect(query.filters.startDate).toEqual(expect.any(Date));
    expect(query.filters.sectorId).toBe('financeiro');
  });

  it('deve rejeitar filtros desconhecidos, tipos inválidos e nomes inseguros', () => {
    expect(() => validateReportQuery(definition, { filters: { unknown: 'x', startDate: '2026-05-01' } })).toThrow();
    expect(() => validateReportQuery(definition, { filters: { startDate: 'data-invalida' } })).toThrow();
    expect(() => validateReportQuery(definition, { filters: { 'startDate;drop': '2026-05-01' } })).toThrow();
  });

  it('deve manter tentativa de SQL Injection como valor parametrizado quando o parâmetro é permitido', () => {
    const payload = "'; DROP TABLE users; --";
    const query = validateReportQuery(definition, {
      filters: {
        startDate: '2026-05-01',
        sectorId: payload,
      },
    });

    expect(query.filters.sectorId).toBe(payload);
  });
});
