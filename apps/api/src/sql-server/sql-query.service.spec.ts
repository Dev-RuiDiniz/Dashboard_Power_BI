import { SqlQueryExecutionError, SqlQueryService } from './sql-query.service';
import { OracleService } from './oracle.service';
import { QueryCacheService } from './query-cache.service';
import { SqlServerService } from './sql-server.service';

const mockInput = jest.fn();
const mockQuery = jest.fn();
const mockExecute = jest.fn();
const mockOracleExecute = jest.fn();

const createSqlServerService = (): jest.Mocked<Pick<SqlServerService, 'getPool'>> =>
  ({
    getPool: jest.fn().mockResolvedValue({
      request: () => ({
        input: mockInput,
        query: mockQuery,
        execute: mockExecute,
      }),
    }),
  }) as unknown as jest.Mocked<Pick<SqlServerService, 'getPool'>>;

const createOracleExecutor = () =>
  ({
    execute: mockOracleExecute,
  }) as const;

const createService = () =>
  new SqlQueryService(
    createSqlServerService() as unknown as SqlServerService,
    createOracleExecutor() as unknown as OracleService,
  );

const createServiceWithCache = () => {
  const cache = new QueryCacheService({ ttlMs: 60000, maxEntries: 100 });
  const service = new SqlQueryService(
    createSqlServerService() as unknown as SqlServerService,
    createOracleExecutor() as unknown as OracleService,
    cache,
  );
  return { service, cache };
};

describe('SqlQueryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInput.mockReturnThis();
    mockQuery.mockResolvedValue({ recordset: [{ id: 1 }] });
    mockExecute.mockResolvedValue({ recordset: [{ id: 2 }] });
    mockOracleExecute.mockResolvedValue([{ id: 3 }]);
  });

  it('deve executar view com query parametrizada e sem interpolar valores', async () => {
    const service = createService();
    const injectionPayload = "'; DROP TABLE users; --";

    const result = await service.executeView({
      viewName: 'reports.vw_dashboard_reports',
      columns: ['id', 'name'],
      filters: [
        { column: 'name', name: 'search', type: 'string', value: injectionPayload, maxLength: 100 },
      ],
    });

    expect(result).toEqual([{ id: 1 }]);
    expect(mockQuery).toHaveBeenCalledWith(
      'SELECT id, name FROM reports.vw_dashboard_reports WHERE name = @search',
    );
    expect(mockInput).toHaveBeenCalledWith('search', expect.anything(), injectionPayload);
    expect(mockQuery.mock.calls[0][0]).not.toContain(injectionPayload);
  });

  it('deve rejeitar view, coluna e parâmetro inseguros', async () => {
    const service = createService();

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
    const service = createService();
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
    const service = createService();

    await expect(
      service.executeStoredProcedure({
        procedureName: 'reports.sp_get_report_data; DROP TABLE users',
      }),
    ).rejects.toThrow();
  });

  it('deve retornar erro sanitizado quando driver falhar', async () => {
    mockQuery.mockRejectedValueOnce(
      new Error('Login failed for user powerbi_readonly with password secret'),
    );

    const service = createService();

    await expect(
      service.executeView({
        viewName: 'reports.vw_dashboard_reports',
      }),
    ).rejects.toThrow(SqlQueryExecutionError);
  });

  it('deve executar view em Oracle com bind por nome', async () => {
    const service = createService();

    const result = await service.executeView(
      {
        viewName: 'AGNEW.ESTOQUE',
        columns: ['SEQ_EMPRESA', 'DESCRICAO'],
        filters: [{ column: 'SEQ_EMPRESA', name: 'SEQ_EMPRESA', type: 'int', value: 1 }],
      },
      'oracle',
    );

    expect(result).toEqual([{ id: 3 }]);
    expect(mockOracleExecute).toHaveBeenCalledWith(
      'SELECT SEQ_EMPRESA, DESCRICAO FROM AGNEW.ESTOQUE WHERE SEQ_EMPRESA = :SEQ_EMPRESA',
      expect.objectContaining({
        SEQ_EMPRESA: expect.objectContaining({ val: 1 }),
      }),
      expect.objectContaining({ outFormat: expect.anything() }),
    );
  });

  it('deve executar procedure Oracle via bloco PL/SQL', async () => {
    const service = createService();

    const result = await service.executeStoredProcedure(
      {
        procedureName: 'AGNEW.PRELATORIO',
        parameters: [{ name: 'P_EMPRESA', type: 'int', value: 1 }],
      },
      'oracle',
    );

    expect(result).toEqual([{ id: 3 }]);
    expect(mockOracleExecute).toHaveBeenCalledWith(
      expect.stringContaining('BEGIN AGNEW.PRELATORIO('),
      expect.objectContaining({
        P_EMPRESA: expect.objectContaining({ val: 1 }),
        result_cursor: expect.anything(),
      }),
    );
  });

  it('deve retornar resultado cacheado na segunda chamada de executeView (cache hit)', async () => {
    const { service } = createServiceWithCache();

    await service.executeView({ viewName: 'reports.vw_test' });
    await service.executeView({ viewName: 'reports.vw_test' });

    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('deve executar query quando parametros diferem (cache miss)', async () => {
    const { service } = createServiceWithCache();

    await service.executeView({
      viewName: 'reports.vw_test',
      filters: [{ column: 'id', name: 'id', type: 'int', value: 1 }],
    });
    await service.executeView({
      viewName: 'reports.vw_test',
      filters: [{ column: 'id', name: 'id', type: 'int', value: 2 }],
    });

    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('deve retornar resultado cacheado na segunda chamada de executeStoredProcedure (cache hit)', async () => {
    const { service } = createServiceWithCache();

    await service.executeStoredProcedure({ procedureName: 'reports.sp_test' });
    await service.executeStoredProcedure({ procedureName: 'reports.sp_test' });

    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('deve sempre executar query quando cache nao esta injetado', async () => {
    const service = createService();

    await service.executeView({ viewName: 'reports.vw_test' });
    await service.executeView({ viewName: 'reports.vw_test' });

    expect(mockQuery).toHaveBeenCalledTimes(2);
  });
});
