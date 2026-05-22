import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthenticatedLayout } from './authenticated-layout';
import * as session from '@/lib/auth/session';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

jest.mock('@/lib/auth/session', () => ({
  getAuthSession: jest.fn(() => ({
    accessToken: 'access',
    refreshToken: 'refresh',
    tokenType: 'Bearer',
    expiresIn: 900,
  })),
  clearAuthSession: jest.fn(),
}));

describe('AuthenticatedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar header, sidebar e conteúdo', async () => {
    render(
      <AuthenticatedLayout>
        <p>Conteúdo da rota</p>
      </AuthenticatedLayout>,
    );

    expect(await screen.findByText('Área autenticada')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard Power BI' })).toBeInTheDocument();
    expect(screen.getByText('Visão geral')).toBeInTheDocument();
    expect(screen.getByText('Relatórios')).toBeInTheDocument();
    expect(screen.getByText('Administração')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo da rota')).toBeInTheDocument();
  });

  it('deve limpar sessão e redirecionar ao sair', async () => {
    render(
      <AuthenticatedLayout>
        <p>Conteúdo da rota</p>
      </AuthenticatedLayout>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Sair' }));

    expect(session.clearAuthSession).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/login');
  });
});
