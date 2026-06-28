import { ExecutionContext, ForbiddenException } from '@nestjs/common';

import { UsersRepository } from '../repositories/users.repository';
import { AuthenticatedRequestUser } from '../types/auth.types';
import { TwoFactorGuard } from './two-factor.guard';

function createMockContext(user: AuthenticatedRequestUser | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;
}

function createMockUsersRepository(
  findById: jest.Mock,
): jest.Mocked<Pick<UsersRepository, 'findById'>> {
  return { findById } as unknown as jest.Mocked<Pick<UsersRepository, 'findById'>>;
}

const adminUser: AuthenticatedRequestUser = {
  sub: 'admin-1',
  email: 'admin@example.com',
  roles: ['admin'],
  sectors: ['financeiro'],
  jti: 'jti-1',
  tv: 1,
};

const viewerUser: AuthenticatedRequestUser = {
  sub: 'viewer-1',
  email: 'viewer@example.com',
  roles: ['viewer'],
  sectors: ['financeiro'],
  jti: 'jti-2',
  tv: 1,
};

describe('TwoFactorGuard', () => {
  let guard: TwoFactorGuard;
  let usersRepository: jest.Mocked<Pick<UsersRepository, 'findById'>>;

  beforeEach(() => {
    usersRepository = createMockUsersRepository(jest.fn());
    guard = new TwoFactorGuard(usersRepository as unknown as UsersRepository);
  });

  it('deve bloquear admin sem 2FA ativo', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'admin-1',
      isTwoFactorEnabled: false,
      isActive: true,
    } as never);

    await expect(guard.canActivate(createMockContext(adminUser))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve permitir admin com 2FA ativo', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'admin-1',
      isTwoFactorEnabled: true,
      isActive: true,
    } as never);

    await expect(guard.canActivate(createMockContext(adminUser))).resolves.toBe(true);
  });

  it('deve permitir usuario nao-admin sem 2FA', async () => {
    usersRepository.findById.mockResolvedValue({
      id: 'viewer-1',
      isTwoFactorEnabled: false,
      isActive: true,
    } as never);

    await expect(guard.canActivate(createMockContext(viewerUser))).resolves.toBe(true);
  });

  it('deve bloquear quando usuario nao autenticado', async () => {
    await expect(guard.canActivate(createMockContext(undefined))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve bloquear quando usuario nao encontrado no repositorio', async () => {
    usersRepository.findById.mockResolvedValue(null as never);

    await expect(guard.canActivate(createMockContext(adminUser))).rejects.toThrow(
      ForbiddenException,
    );
  });
});
