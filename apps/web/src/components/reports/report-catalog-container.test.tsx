import { render, screen, waitFor } from '@testing-library/react';

import { ReportCatalogContainer } from './report-catalog-container';
import { fetchReports } from '@/lib/reports-api';

jest.mock('@/lib/reports-api', () => ({
  fetchReports: jest.fn(),
}));

const fetchReportsMock = fetchReports as jest.MockedFunction<typeof fetchReports>;

describe('ReportCatalogContainer', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('exibe estado de loading enquanto carrega a Reports API', () => {
    fetchReportsMock.mockReturnValueOnce(new Promise(() => undefined));

    render(<ReportCatalogContainer token="jwt-token" />);

    expect(screen.getByText('Carregando catálogo de dashboards')).toBeInTheDocument();
  });

  it('renderiza relatorios retornados pela API', async () => {
    fetchReportsMock.mockResolvedValueOnce({
      items: [
        {
          id: 'financeiro-dre',
          name: 'DRE Mensal',
          description: 'Resultado financeiro.',
          sector: 'Financeiro',
          sourceType: 'view',
          requiredPermissions: ['reports:read'],
          status: 'available',
          updatedAt: '2026-05-21T12:00:00.000Z',
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
      totalPages: 1,
    });

    render(<ReportCatalogContainer token="jwt-token" />);

    await waitFor(() => {
      expect(screen.getByText('DRE Mensal')).toBeInTheDocument();
    });

    expect(fetchReportsMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      filters: {},
    });
  });

  it('exibe estado de erro quando a API falha', async () => {
    fetchReportsMock.mockRejectedValueOnce(new Error('Falha controlada'));

    render(<ReportCatalogContainer token="jwt-token" />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar os relatórios.')).toBeInTheDocument();
    });
  });
});
