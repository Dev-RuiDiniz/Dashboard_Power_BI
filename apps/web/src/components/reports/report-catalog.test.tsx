import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReportCatalog, type ReportCatalogItem } from './report-catalog';

const reports: ReportCatalogItem[] = [
  {
    id: 'financeiro-dre',
    name: 'DRE Mensal',
    description: 'Resultado financeiro por competência.',
    sector: 'Financeiro',
    sourceType: 'view',
    requiredPermissions: ['reports:read', 'sector:financeiro'],
    status: 'available',
    updatedAt: '2026-05-21T12:00:00.000Z',
  },
  {
    id: 'operacoes-sla',
    name: 'SLA de Atendimento',
    description: 'Indicadores operacionais de atendimento.',
    sector: 'Operações',
    sourceType: 'procedure',
    requiredPermissions: ['reports:read', 'sector:operacoes'],
    status: 'restricted',
    updatedAt: '2026-05-22T12:00:00.000Z',
  },
];

describe('ReportCatalog', () => {
  it('renderiza relatórios e indicadores resumidos', () => {
    render(<ReportCatalog reports={reports} />);

    expect(screen.getByRole('heading', { name: 'Catálogo de dashboards' })).toBeInTheDocument();
    expect(screen.getByText('DRE Mensal')).toBeInTheDocument();
    expect(screen.getByText('SLA de Atendimento')).toBeInTheDocument();
    expect(screen.getByText('Disponíveis')).toBeInTheDocument();
    expect(screen.getByText('Restritos')).toBeInTheDocument();
  });

  it('filtra relatórios por texto de busca', async () => {
    const user = userEvent.setup();

    render(<ReportCatalog reports={reports} />);

    await user.type(screen.getByLabelText('Buscar relatórios'), 'financeiro');

    expect(screen.getByText('DRE Mensal')).toBeInTheDocument();
    expect(screen.queryByText('SLA de Atendimento')).not.toBeInTheDocument();
  });

  it('exibe estado vazio quando nenhum relatório corresponde aos filtros', async () => {
    const user = userEvent.setup();

    render(<ReportCatalog reports={reports} />);

    await user.type(screen.getByLabelText('Buscar relatórios'), 'jurídico');

    expect(screen.getByText('Nenhum relatório encontrado')).toBeInTheDocument();
  });
});
