import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { EffectivePermissionsService } from '../../permissions/effective-permissions.service';
import { PermissionsGuard } from './permissions.guard';

type MockEffectivePermissionsService = {
  hasPermission: jest.MockedFunction<EffectivePermissionsService['hasPermission']>;
};

const mockEffectivePermissionsService: MockEffectivePermissionsService = {
  hasPermission: jest.fn(),
};

const createMockReflector = (returnValue: string[] | undefined): Reflector =>
  ({ getAllAndOverride: jest.fn().mockReturnValue(returnValue) }) as unknown as Reflector;

const createContext = (user: { sub: string; roles: string[] } | undefined): ExecutionContext =>
  ({
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new PermissionsGuard(
      mockEffectivePermissionsService as unknown as EffectivePermissionsService,
    );
  });

  it('deve permitir acesso quando não houver metadata de permissão', async () => {
    const reflector = createMockReflector(undefined);
    guard = new PermissionsGuard(
      mockEffectivePermissionsService as unknown as EffectivePermissionsService,
      reflector,
    );

    const result = await guard.canActivate(createContext({ sub: 'user-1', roles: ['viewer'] }));

    expect(result).toBe(true);
    expect(mockEffectivePermissionsService.hasPermission).not.toHaveBeenCalled();
  });

  it('deve permitir admin sem checar permissões', async () => {
    const reflector = createMockReflector(['reports:read']);
    guard = new PermissionsGuard(
      mockEffectivePermissionsService as unknown as EffectivePermissionsService,
      reflector,
    );

    const result = await guard.canActivate(createContext({ sub: 'admin-1', roles: ['admin'] }));

    expect(result).toBe(true);
    expect(mockEffectivePermissionsService.hasPermission).not.toHaveBeenCalled();
  });

  it('deve permitir usuário com permissão herdada', async () => {
    const reflector = createMockReflector(['reports:financeiro:read']);
    guard = new PermissionsGuard(
      mockEffectivePermissionsService as unknown as EffectivePermissionsService,
      reflector,
    );

    mockEffectivePermissionsService.hasPermission.mockResolvedValue(true);

    const result = await guard.canActivate(createContext({ sub: 'user-1', roles: ['viewer'] }));

    expect(result).toBe(true);
    expect(mockEffectivePermissionsService.hasPermission).toHaveBeenCalledWith(
      'user-1',
      'reports:financeiro:read',
    );
  });

  it('deve negar usuário sem permissão', async () => {
    const reflector = createMockReflector(['reports:financeiro:export']);
    guard = new PermissionsGuard(
      mockEffectivePermissionsService as unknown as EffectivePermissionsService,
      reflector,
    );

    mockEffectivePermissionsService.hasPermission.mockResolvedValue(false);

    await expect(
      guard.canActivate(createContext({ sub: 'user-1', roles: ['viewer'] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('deve negar quando não há usuário no contexto', async () => {
    const reflector = createMockReflector(['reports:read']);
    guard = new PermissionsGuard(
      mockEffectivePermissionsService as unknown as EffectivePermissionsService,
      reflector,
    );

    await expect(guard.canActivate(createContext(undefined))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
