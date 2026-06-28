import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AuthenticatedLayout } from './authenticated-layout';
import * as authApi from '@/lib/auth/api';
import * as session from '@/lib/auth/session';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/app',
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

jest.mock('@/lib/auth/api', () => ({
  logout: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('@/lib/auth/use-inactivity-timeout', () => ({
  useInactivityTimeout: jest.fn(),
}));

describe('AuthenticatedLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar header, sidebar e conteudo', async () => {
    render(
      <AuthenticatedLayout>
        <p>Conteudo da rota</p>
      </AuthenticatedLayout>,
    );

    expect(await screen.findByText(/autenticada/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dashboard Power BI' })).toBeInTheDocument();
    expect(screen.getByText(/geral/i)).toBeInTheDocument();
    expect(screen.getByText(/relat.rios/i)).toBeInTheDocument();
    expect(screen.getByText('Usuários', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Conteudo da rota')).toBeInTheDocument();
  });

  it('deve limpar sessao e redirecionar ao sair', async () => {
    render(
      <AuthenticatedLayout>
        <p>Conteudo da rota</p>
      </AuthenticatedLayout>,
    );

    await userEvent.click(await screen.findByRole('button', { name: 'Sair' }));

    expect(authApi.logout).toHaveBeenCalledWith('refresh', 'access');
    expect(session.clearAuthSession).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/login');
  });
});
