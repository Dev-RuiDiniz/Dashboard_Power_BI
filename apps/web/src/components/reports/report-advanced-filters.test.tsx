import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ReportAdvancedFilters } from './report-advanced-filters';

describe('ReportAdvancedFilters', () => {
  it('renderiza campos avancados e envia filtros validos', async () => {
    const user = userEvent.setup();
    const onApplyFilters = jest.fn();

    render(<ReportAdvancedFilters onApplyFilters={onApplyFilters} />);

    await user.type(screen.getByLabelText('Data inicial'), '2026-05-01');
    await user.type(screen.getByLabelText('Data final'), '2026-05-31');
    await user.type(screen.getByLabelText('Categoria'), 'dre');
    await user.type(screen.getByLabelText('Setor'), 'financeiro');
    await user.type(screen.getByLabelText('Competencia'), '2026-05');

    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(onApplyFilters).toHaveBeenCalledWith({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      category: 'dre',
      sector: 'financeiro',
      parameters: {
        competencia: '2026-05',
      },
    });
  });

  it('exibe erro de validacao quando periodo e invalido', async () => {
    const user = userEvent.setup();
    const onApplyFilters = jest.fn();

    render(<ReportAdvancedFilters onApplyFilters={onApplyFilters} />);

    await user.type(screen.getByLabelText('Data inicial'), '2026-06-01');
    await user.type(screen.getByLabelText('Data final'), '2026-05-01');
    await user.click(screen.getByRole('button', { name: 'Aplicar filtros' }));

    expect(screen.getByText('A data inicial nao pode ser maior que a data final.')).toBeInTheDocument();
    expect(onApplyFilters).not.toHaveBeenCalled();
  });

  it('limpa filtros e emite payload vazio', async () => {
    const user = userEvent.setup();
    const onApplyFilters = jest.fn();

    render(<ReportAdvancedFilters onApplyFilters={onApplyFilters} />);

    await user.type(screen.getByLabelText('Categoria'), 'dre');
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    expect(onApplyFilters).toHaveBeenCalledWith({});
  });
});
