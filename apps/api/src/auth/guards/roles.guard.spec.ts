import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';

const createContext = (roles: string[] | undefined, userRoles: string[] = []) =>
  ({
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({
        user: {
          sub: 'user-1',
          email: 'user@example.com',
          roles: userRoles,
          sectors: ['financeiro'],
        },
      }),
    }),
  }) as any;

describe('RolesGuard', () => {
  it('deve permitir acesso quando não houver metadata de role', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(undefined))).toBe(true);
  });

  it('deve permitir usuário com role exigida', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['downloader']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext(['downloader'], ['downloader']))).toBe(true);
  });

  it('deve negar usuário sem role exigida', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['downloader']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(() => guard.canActivate(createContext(['downloader'], ['viewer']))).toThrow(ForbiddenException);
  });
});
