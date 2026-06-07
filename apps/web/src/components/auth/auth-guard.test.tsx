import { render, screen, waitFor } from '@testing-library/react';

import { AuthGuard } from './auth-guard';
import { getAuthSession } from '@/lib/auth/session';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

jest.mock('@/lib/auth/session', () => ({
  getAuthSession: jest.fn(),
}));

const getAuthSessionMock = getAuthSession as jest.MockedFunction<typeof getAuthSession>;

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('deve redirecionar para login quando nao houver sessao', async () => {
    getAuthSessionMock.mockReturnValue(null);

    render(
      <AuthGuard>
        <p>Conteudo protegido</p>
      </AuthGuard>,
    );

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Conteudo protegido')).not.toBeInTheDocument();
  });

  it('deve renderizar conteudo quando houver sessao', async () => {
    getAuthSessionMock.mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    render(
      <AuthGuard>
        <p>Conteudo protegido</p>
      </AuthGuard>,
    );

    expect(await screen.findByText('Conteudo protegido')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
