import { render, screen, waitFor } from '@testing-library/react';

import { AuthGuard } from './auth-guard';
import * as session from '@/lib/auth/session';

const replace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('deve redirecionar para login quando não houver sessão', async () => {
    jest.spyOn(session, 'getAuthSession').mockReturnValue(null);

    render(
      <AuthGuard>
        <p>Conteúdo protegido</p>
      </AuthGuard>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Verificando sessão');
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login'));
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('deve renderizar conteúdo quando houver sessão', async () => {
    jest.spyOn(session, 'getAuthSession').mockReturnValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      tokenType: 'Bearer',
      expiresIn: 900,
    });

    render(
      <AuthGuard>
        <p>Conteúdo protegido</p>
      </AuthGuard>,
    );

    expect(await screen.findByText('Conteúdo protegido')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
