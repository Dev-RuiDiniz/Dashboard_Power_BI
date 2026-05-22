import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ForgotPasswordForm } from './forgot-password-form';
import * as api from '@/lib/auth/api';

jest.mock('@/lib/auth/api');

describe('ForgotPasswordForm', () => {
  beforeEach(() => jest.resetAllMocks());

  it('deve validar e-mail obrigatório', async () => {
    render(<ForgotPasswordForm />);
    await userEvent.click(screen.getByRole('button', { name: /enviar instruções/i }));
    expect(await screen.findByText('Informe seu e-mail.')).toBeInTheDocument();
  });

  it('deve exibir mensagem genérica de sucesso', async () => {
    jest.spyOn(api, 'forgotPassword').mockResolvedValue({
      success: true,
      message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.',
    });
    render(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'admin@example.com');
    await userEvent.click(screen.getByRole('button', { name: /enviar instruções/i }));
    expect(await screen.findByRole('status')).toHaveTextContent('Se o e-mail estiver cadastrado');
  });
});
