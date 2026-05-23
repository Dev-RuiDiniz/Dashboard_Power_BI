import { SqlQueryExecutionError, SqlQueryService } from './sql-query.service';
import { SqlServerService } from './sql-server.service';

const mockInput = jest.fn();
const mockQuery = jest.fn();
const mockExecute = jest.fn();

const createSqlServerService = (): jest.Mocked<Pick<SqlServerService, 'getPool'>>
  ({
    getPool: jest.fn().mockResolvedValue({
      request: () => ({
        input: mockInput,
        query: mockQuery,
        execute: mockExecute,
      }),
    }),
  }) as unknown as jest.Mocked<Pick<SqlServerService, 'getPool'>>;

describe('SqlQueryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInput.mockReturnThis();
    mockQuery.mockResolvedValue({ recordset: [{ id: 1 }] });
    mockExecute.mockResolvedValue({ recordset: [{ id: 2 }] });
  });

  it('deve executar view com query parametrizada e sem interpolar valores', async () => {
    const service = new SqlQueryService(createSqlServerService() as SqlServerService);
    const injectionPayload = "'; DROP TABLE users; --";

    const result = await service.executeView({
      viewName: 'reports.vw_dashboard_reports',
      columns: ['id', 'name'],
      filters: [{ column: 'name', name: 'search', type: 'string', value: injectionPayload, maxLength: 100 }],
    });

    expect(result).toEqual([{ id: 1 }]);
    expect(mockQuery).toHaveBeenCalledWith('SELECT id, name FROM reports.vw_dashboard_reports WHERE name = @search');
    expect(mockInput).toHaveBeenCalledWith('search', expect.anything(), injectionPayload);
    expect(mockQuery.mock.calls[0][0]).not.toContain(injectionPayload);
  });

  it('deve rejeitar view, coluna e parâmetro inseguros', async () => {
    const service = new SqlQueryService(createSqlServerService() as SqlServerService);

    await expect(
      service.executeView({
        viewName: 'reports.vw_dashboard_reports; DROP TABLE users',
      }),
    ).rejects.toThrow();

    await expect(
      service.executeView({
        viewName: 'reports.vw_dashboard_reports',
        columns: ['id; DROP'],
      }),
    ).rejects.toThrow();

    await expect(
      service.executeView({
        viewName: 'reports.vw_dashboard_reports',
        filters: [{ column: 'name--', name: 'search', type: 'string', value: 'abc' }],
      }),
    ).rejects.toThrow();
  });

  it('deve executar stored procedure usando execute e parâmetros tipados', async () => {
    const service = new SqlQueryService(createSqlServerService() as SqlServerService);
    const injectionPayload = '1; DROP TABLE users';

    const result = await service.executeStoredProcedure({
      procedureName: 'reports.sp_get_report_data',
      parameters: [{ name: 'reportId', type: 'string', value: injectionPayload, maxLength: 50 }],
    });

    expect(result).toEqual([{ id: 2 }]);
    expect(mockExecute).toHaveBeenCalledWith('reports.sp_get_report_data');
    expect(mockInput).toHaveBeenCalledWith('reportId', expect.anything(), injectionPayload);
    expect(mockExecute.mock.calls[0][0]).not.toContain(injectionPayload);
  });

  it('deve rejeitar stored procedure insegura', async () => {
    const service = new SqlQueryService(createSqlServerService() as SqlServerService);

    await expect(
      service.executeStoredProcedure({
        procedureName: 'reports.sp_get_report_data; DROP TABLE users',
      }),
    ).rejects.toThrow();
  });

  it('deve retornar erro sanitizado quando driver falhar', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Login failed for user powerbi_readonly with password secret'));

    const service = new SqlQueryService(createSqlServerService() as SqlServerService);

    await expect(
      service.executeView({j        viewName: 'reports.vw_dashboard_reports',
      }),
    ).rejects.toThrow(SqlQueryExecutionError);
  });
});
