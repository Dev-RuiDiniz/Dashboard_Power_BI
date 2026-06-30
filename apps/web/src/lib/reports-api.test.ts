import { apiGet } from './admin-api';
import { fetchReports } from './reports-api';

jest.mock('./admin-api', () => ({
  apiGet: jest.fn(),
}));

describe('fetchReports', () => {
  const apiGetMock = apiGet as jest.MockedFunction<typeof apiGet>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('chama Reports API com paginacao', async () => {
    apiGetMock.mockResolvedValueOnce({
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
    });

    const response = await fetchReports({ page: 1, pageSize: 20 });

    expect(apiGetMock).toHaveBeenCalledWith('/reports?page=1&pageSize=20');
    expect(response.items).toHaveLength(1);
    expect(response.items[0]).toBeDefined();
    expect(response.items[0]!).toMatchObject({
      id: 'financeiro-dre',
      sourceType: 'view',
      status: 'available',
    });
  });

  it('envia filtros avancados na query string', async () => {
    apiGetMock.mockResolvedValueOnce({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
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

    expect(apiGetMock).toHaveBeenCalledWith(
      '/reports?page=1&pageSize=20&startDate=2026-05-01&endDate=2026-05-31&category=dre&sector=financeiro&parameters%5Bcompetencia%5D=2026-05',
    );
  });

  it('normaliza stored_procedure para procedure no catálogo do frontend', async () => {
    apiGetMock.mockResolvedValueOnce({
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
    });

    const response = await fetchReports({ page: 1, pageSize: 20 });

    expect(response.items[0]).toBeDefined();
    expect(response.items[0]!.sourceType).toBe('procedure');
  });

  it('propaga erro quando a API falha', async () => {
    apiGetMock.mockRejectedValueOnce(new Error('Sem permissao'));

    await expect(fetchReports({ page: 1, pageSize: 20 })).rejects.toThrow('Sem permissao');
  });
});
