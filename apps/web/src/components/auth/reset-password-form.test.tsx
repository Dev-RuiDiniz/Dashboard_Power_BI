import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ResetPasswordForm } from './reset-password-form';
import * as api from '@/lib/auth/api';

jest.mock('@/lib/auth/api');

describe('ResetPasswordForm', () => {
  beforeEach(() => jest.resetAllMocks());

  it('deve exigir token', () => {
    render(<ResetPasswordForm />);
    expect(screen.getByRole('alert')).toHaveTextContent('Token de recuperação não informado.');
  });

  it('deve redefinir senha com sucesso', async () => {
    jest.spyOn(api, 'resetPassword').mockResolvedValue({ success: true });
    render(<ResetPasswordForm token="token" />);
    await userEvent.type(screen.getByLabelText('Nova senha'), 'NovaSenha123!');
    await userEvent.type(screen.getByLabelText('Confirmar senha'), 'NovaSenha123!');
    await userEvent.click(screen.getByRole('button', { name: /redefinir senha/i }));
    expect(api.resetPassword).toHaveBeenCalledWith('token', 'NovaSenha123!');
    expect(await screen.findByRole('status')).toHaveTextContent('Senha redefinida com sucesso');
  });
});
