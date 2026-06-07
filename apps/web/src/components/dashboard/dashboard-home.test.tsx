import { render, screen, waitFor } from '@testing-library/react';

import { DashboardHome } from './dashboard-home';

jest.mock('@/lib/supabase', () => {
  const from = jest.fn((table: string) => ({
    select: jest.fn(() => ({
      eq: jest.fn(async () => {
        if (table === 'kpis') {
          return {
            data: [
              {
                id: 'receita',
                name: 'Receita mensal',
                sector_id: 'financeiro',
                unit: 'currency',
                target_value: 120000,
                is_active: true,
              },
              {
                id: 'leads',
                name: 'Leads qualificados',
                sector_id: 'comercial',
                unit: 'number',
                target_value: 430,
                is_active: true,
              },
              {
                id: 'sla',
                name: 'SLA operacional',
                sector_id: 'operacoes',
                unit: 'percent',
                target_value: 0.92,
                is_active: true,
              },
            ],
          };
        }

        return {
          data: [
            { id: 'financeiro', code: 'FIN', name: 'Financeiro' },
            { id: 'comercial', code: 'COM', name: 'Comercial' },
            { id: 'operacoes', code: 'OPE', name: 'Operacoes' },
          ],
        };
      }),
    })),
  }));

  return {
    supabase: { from },
  };
});

describe('DashboardHome', () => {
  it('renderiza cards principais e resumo por setor', async () => {
    render(<DashboardHome />);

    expect(await screen.findByRole('heading', { name: 'Dashboard Home' })).toBeInTheDocument();
    expect(screen.getByText('Receita mensal')).toBeInTheDocument();
    expect(screen.getByText('Leads qualificados')).toBeInTheDocument();
    expect(screen.getByText('SLA operacional')).toBeInTheDocument();
    expect(screen.getAllByText('Financeiro').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Comercial').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Operacoes').length).toBeGreaterThan(0);
  });

  it('renderiza fallback quando a carga falha', async () => {
    const { supabase } = jest.requireMock('@/lib/supabase') as {
      supabase: { from: jest.Mock };
    };

    supabase.from.mockImplementationOnce(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(async () => {
          throw new Error('falha');
        }),
      })),
    }));

    render(<DashboardHome />);

    await waitFor(() => {
      expect(screen.getByText('Receita mensal')).toBeInTheDocument();
    });
  });
});
