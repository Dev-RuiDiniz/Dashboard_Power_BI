import { render, screen } from '@testing-library/react';

import HomePage from './page';

describe('HomePage', () => {
  it('deve renderizar a home institucional com CTA para login', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Dashboard Power BI' })).toBeInTheDocument();
    expect(screen.getByText(/governanca, visibilidade e controle/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrar na plataforma' })).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByText('Controle de acesso')).toBeInTheDocument();
    expect(screen.getByText('Visao consolidada')).toBeInTheDocument();
    expect(screen.getByText('Operacao mais segura')).toBeInTheDocument();
  });
});
