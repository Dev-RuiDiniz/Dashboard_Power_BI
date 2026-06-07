import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetService } from './services/password-reset.service';
import { AuthenticatedRequestUser } from './types/auth.types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'getCurrentUser' | 'changePassword'>>;

  beforeEach(() => {
    authService = {
      getCurrentUser: jest.fn(),
      changePassword: jest.fn(),
    };

    controller = new AuthController(
      authService as unknown as AuthService,
      {} as PasswordResetService,
    );
  });

  it('deve retornar o usuario autenticado em me', async () => {
    const user: AuthenticatedRequestUser = {
      sub: 'demo-admin',
      email: 'admin@example.com',
      roles: ['admin'],
      sectors: ['financeiro'],
    };

    authService.getCurrentUser.mockResolvedValue({
      id: 'demo-admin',
      email: 'admin@example.com',
      roles: ['admin'],
      sectors: ['financeiro'],
      groupIds: [],
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      deactivatedAt: null,
    });

    const response = await controller.me(user);

    expect(authService.getCurrentUser).toHaveBeenCalledWith('demo-admin');
    expect(response.id).toBe('demo-admin');
    expect(response.email).toBe('admin@example.com');
  });

  it('deve delegar a troca de senha para o servico', async () => {
    const user: AuthenticatedRequestUser = {
      sub: 'demo-admin',
      email: 'admin@example.com',
      roles: ['admin'],
      sectors: ['financeiro'],
    };

    authService.changePassword.mockResolvedValue({ success: true });

    await expect(
      controller.changeMyPassword(user, {
        currentPassword: 'Admin123!',
        newPassword: 'NovaSenha123!',
      }),
    ).resolves.toEqual({ success: true });

    expect(authService.changePassword).toHaveBeenCalledWith(
      'demo-admin',
      'Admin123!',
      'NovaSenha123!',
    );
  });
});
