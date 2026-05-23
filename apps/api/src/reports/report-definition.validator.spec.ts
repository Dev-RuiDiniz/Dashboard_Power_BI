import {
  ReportDefinitionValidationError,
  validateCreateReportDefinition,
  validateSector,
} from './report-definition.validator';

describe('report-definition.validator', () => {
  const validInput = {
    name: 'Relatório Financeiro',
    description: 'Visão consolidada do setor financeiro.',
    sector: 'Financeiro',
    sourceType: 'view' as const,
    sourceName: 'reports.vw_financial_reports',
    parameters: [{ name: 'startDate', type: 'date' as const, required: true }],
    requiredPermissions: ['reports:financeiro:read'],
  };

  it('deve validar e normalizar definição de relatório', () => {
    expect(validateCreateReportDefinition(validInput)).toEqual({
      ...validInput,
      sector: 'financeiro',
      isActive: true,
    });
  });

  it.each([
    ['name', ''],
    ['description', ''],
    ['sector', ''],
    ['sourceName', 'reports.vw_reports; DROP TABLE users'],
  ])('deve rejeitar campo obrigatório ou perigoso: %s', (field, value) => {
    expect(() => validateCreateReportDefinition({ ...validInput, [field]: value })).toThrow(
      ReportDefinitionValidationError,
    );
  });

  it('deve rejeitar tipo de fonte SQL inválido', () => {
    expect(() => validateCreateReportDefinition({ ...validInput, sourceType: 'query' as never })).toThrow(
      ReportDefinitionValidationError,
    );
  });

  it('deve rejeitar parâmetros inválidos ou duplicados', () => {
    expect(() =>
      validateCreateReportDefinition({
        ...validInput,
        parameters: [{ name: 'id;drop', type: 'string' }],
      }),
    ).toThrow();

    expect(() =>
      validateCreateReportDefinition({
        ...validInput,
        parameters: [
          { name: 'reportId', type: 'string' },
          { name: 'reportId', type: 'int' },
        ],
      }),
    ).toThrow();

    expect(() =>
      validateCreateReportDefinition({
        ...validInput,
        parameters: [{ name: 'reportId', type: 'object' as never }],
      }),
    ).toThrow();
  });

  it('deve rejeitar permissões inseguras', () => {
    expect(() =>
      validateCreateReportDefinition({
        ...validInput,
        requiredPermissions: ['reports:read;drop'],
      }),
    ).toThrow(ReportDefinitionValidationError);
  });

  it('deve normalizar setor para listagem', () => {
    expect(validateSector(' Financeiro ')).toBe('financeiro');
  });
});
