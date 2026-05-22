import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from './login-form';
import * as api from '@/lib/auth/api';

const push = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

jest.mock('@/lib/auth/api');

describe('LoginForm', () => {
  beforeEach(() => jest.resetAllMocks());

  it('deve validar campos obrigatórios', async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText('Informe seu e-mail.')).toBeInTheDocument();
  });

  it('deve executar happy path de login e redirecionar', async () => {
    jest.spyOn(api, 'login').mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh', tokenType: 'Bearer', expiresIn: 900 });
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/senha/i), 'Admin123!');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(api.login).toHaveBeenCalledWith('admin@example.com', 'Admin123!');
    expect(push).toHaveBeenCalledWith('/app');
  });
});
