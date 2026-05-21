import { render, screen } from '@testing-library/react';

import HomePage from './page';

describe('HomePage', () => {
  it('deve renderizar a home com informações do produto', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Dashboard Power BI' })).toBeInTheDocument();
    expect(screen.getByText(/Plataforma web para centralizar relatórios/i)).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByText('Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Administração')).toBeInTheDocument();
  });
});
