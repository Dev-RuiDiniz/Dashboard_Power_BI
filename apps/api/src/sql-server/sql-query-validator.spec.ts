import {
  SqlQueryValidationError,
  validateSqlColumnName,
  validateSqlObjectName,
  validateSqlParameterName,
} from './sql-query-validator';

describe('sql-query-validator', () => {
  describe('validateSqlObjectName', () => {
    it.each(['dbo.vw_reports', 'reports.sp_get_report_data', 'schema_1.object_2'])(
      'deve aceitar identificador qualificado seguro: %s',
      (value) => {
        expect(validateSqlObjectName(value)).toBe(value);
      },
    );

    it.each([
      '',
      'vw_reports',
      'dbo.',
      '.vw_reports',
      'dbo.vw reports',
      'dbo.vw_reports; DROP TABLE users',
      'dbo.vw_reports--',
      'dbo.vw_reports/*comment*/',
      'dbo].[users',
      'SELECT * FROM users',
      'dbo.vw_reports UNION SELECT password FROM users',
      'exec dbo.sp_insegura',
    ])('deve rejeitar identificador perigoso: %s', (value) => {
      expect(() => validateSqlObjectName(value)).toThrow(SqlQueryValidationError);
    });
  });

  describe('validateSqlColumnName', () => {
    it.each(['id', 'report_id', 'createdAt', 'coluna_1'])('deve aceitar coluna segura: %s', (value) => {
      expect(validateSqlColumnName(value)).toBe(value);
    });

    it.each(['', 'report.id', 'report id', 'id; drop table users', 'id--', '[id]', 'select'])(
      'deve rejeitar coluna insegura: %s',
      (value) => {
        expect(() => validateSqlColumnName(value)).toThrow(SqlQueryValidationError);
      },
    );
  });

  describe('validateSqlParameterName', () => {
    it.each(['reportId', 'sector_id', 'param1'])('deve aceitar parâmetro seguro: %s', (value) => {
      expect(validateSqlParameterName(value)).toBe(value);
    });

    it.each(['', '@reportId', 'report.id', 'report id', 'id;drop', 'id--', 'exec'])(
      'deve rejeitar parâmetro inseguro: %s',
      (value) => {
        expect(() => validateSqlParameterName(value)).toThrow(SqlQueryValidationError);
      },
    );
  });
});
