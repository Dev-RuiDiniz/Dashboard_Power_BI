import { normalizeSqlParameters, SqlParameterValidationError } from './sql-parameters';

describe('normalizeSqlParameters', () => {
  it('deve normalizar parâmetros tipados permitidos', () => {
    const parameters = normalizeSqlParameters(
      [
        { name: 'reportId', type: 'string', required: true, maxLength: 50 },
        { name: 'page', type: 'int', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'active', type: 'boolean', required: true },
        { name: 'createdAt', type: 'date', required: true },
      ],
      {
        reportId: 'abc',
        page: '2',
        amount: '10.5',
        active: 'true',
        createdAt: '2026-05-23T00:00:00.000Z',
      },
    );

    expect(parameters).toEqual([
      expect.objectContaining({ name: 'reportId', type: 'string', value: 'abc' }),
      expect.objectContaining({ name: 'page', type: 'int', value: 2 }),
      expect.objectContaining({ name: 'amount', type: 'number', value: 10.5 }),
      expect.objectContaining({ name: 'active', type: 'boolean', value: true }),
      expect.objectContaining({ name: 'createdAt', type: 'date', value: expect.any(Date) }),
    ]);
  });

  it('deve manter tentativa de SQL Injection como valor parametrizado', () => {
    const payload = "'; DROP TABLE users; --";

    const parameters = normalizeSqlParameters(
      [{ name: 'search', type: 'string', required: true, maxLength: 100 }],
      { search: payload },
    );

    expect(parameters[0]).toEqual(expect.objectContaining({ name: 'search', value: payload }));
  });

  it.each([
    [{ allowed: 'ok', unexpected: 'x' }, 'Parâmetro não permitido'],
    [{ 'param;drop': 'x' }, 'parâmetro SQL contém trecho não permitido'],
    [{ allowed: { nested: true } }, 'Parâmetro inválido'],
    [{ allowed: ['a'] }, 'Parâmetro inválido'],
    [{ allowed: 'x'.repeat(11) }, 'tamanho máximo'],
  ])('deve rejeitar parâmetros inseguros: %#', (values, expectedMessage) => {
    expect(() =>
      normalizeSqlParameters([{ name: 'allowed', type: 'string', required: true, maxLength: 10 }], values),
    ).toThrow(expectedMessage);
  });

  it('deve rejeitar parâmetro obrigatório ausente', () => {
    expect(() => normalizeSqlParameters([{ name: 'reportId', type: 'string', required: true }], {})).toThrow(
      SqlParameterValidationError,
    );
  });

  it('deve rejeitar tipos incompatíveis', () => {
    expect(() => normalizeSqlParameters([{ name: 'page', type: 'int', required: true }], { page: '1.5' })).toThrow(
      SqlParameterValidationError,
    );

    expect(() =>
      normalizeSqlParameters([{ name: 'active', type: 'boolean', required: true }], { active: 'talvez' }),
    ).toThrow(SqlParameterValidationError);

    expect(() =>
      normalizeSqlParameters([{ name: 'createdAt', type: 'date', required: true }], { createdAt: 'data-invalida' }),
    ).toThrow(SqlParameterValidationError);
  });
});
