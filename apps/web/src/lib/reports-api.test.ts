import { fetchReports } from './reports-api';

describe('fetchReports', () => {
  const originalEnv = process.env.NEXT_PUBLIC_API_URL;
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalEnv;
  });

  it('chama Reports API com paginacao e token bearer', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'financeiro-dre',
            name: 'DRE Mensal',
            description: 'Resultado financeiro.',
            sector: 'Financeiro',
            sourceType: 'view',
            requiredPermissions: ['reports:read'],
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
      }),
    });

    const response = await fetchReports({ page: 1, pageSize: 20, token: 'jwt-token' });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/reports?page=1&pageSize=20', {
      headers: {
        Authorization: 'Bearer jwt-token',
        Accept: 'application/json',
      },
      cache: 'no-store',
    });
    expect(response.items).toHaveLength(1);
    expect(response.items[0]).toMatchObject({
      id: 'financeiro-dre',
      sourceType: 'view',
      status: 'available',
    });
  });

  it('envia filtros avancados na query string', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      }),
    });

    await fetchReports({
      page: 1,
      pageSize: 20,
      filters: {
        startDate: '2026-05-01',
        endDate: '2026-05-31',
        category: 'dre',
        sector: 'financeiro',
        parameters: {
          competencia: '2026-05',
        },
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/reports?page=1&pageSize=20&startDate=2026-05-01&endDate=2026-05-31&category=dre&sector=financeiro&parameters%5Bcompetencia%5D=2026-05',
      {
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      },
    );
  });

  it('normaliza stored_procedure para procedure no catálogo do frontend', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'comercial-funil',
            name: 'Funil de Vendas',
            description: 'Pipeline comercial.',
            sector: 'Comercial',
            sourceType: 'stored_procedure',
            requiredPermissions: ['reports:read'],
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
      }),
    });

    const response = await fetchReports({ page: 1, pageSize: 20 });

    expect(response.items[0].sourceType).toBe('procedure');
  });

  it('retorna erro controlado quando a API falha', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      json: async () => ({ message: 'Sem permissao' }),
    });

    await expect(fetchReports({ page: 1, pageSize: 20, token: 'jwt-token' })).rejects.toThrow(
      'Não foi possível carregar os relatórios.',
    );
  });
});
