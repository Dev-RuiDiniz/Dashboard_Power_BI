import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { SectorsGuard } from './sectors.guard';

const createContext = (requiredSectors: string[] | undefined, userSectors: string[] = [], userRoles: string[] = ['viewer'], routeSector?: string) =>
  ({
    getHandler: () => 'handler',
    getClass: () => 'class',
    switchToHttp: () => ({
      getRequest: () => ({
        params: routeSector ? { sector: routeSector } : {},
        user: {
          sub: 'user-1',
          email: 'user@example.com',
          roles: userRoles,
          sectors: userSectors,
        },
      }),
    }),
  }) as any;

describe('SectorsGuard', () => {
  it('deve permitir acesso quando não houver setor exigido', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new SectorsGuard(reflector);

    expect(guard.canActivate(createContext(undefined))).toBe(true);
  });

  it('deve permitir usuário do setor financeiro acessar recurso financeiro', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['financeiro']) } as unknown as Reflector;
    const guard = new SectorsGuard(reflector);

    expect(guard.canActivate(createContext(['financeiro'], ['financeiro']))).toBe(true);
  });

  it('deve negar usuário de outro setor', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['financeiro']) } as unknown as Reflector;
    const guard = new SectorsGuard(reflector);

    expect(() => guard.canActivate(createContext(['financeiro'], ['comercial']))).toThrow(ForbiddenException);
  });

  it('deve permitir admin em qualquer setor', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(['financeiro']) } as unknown as Reflector;
    const guard = new SectorsGuard(reflector);

    expect(guard.canActivate(createContext(['financeiro'], ['comercial'], ['admin']))).toBe(true);
  });

  it('deve usar parâmetro de rota como setor exigido quando não houver metadata estática', () => {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new SectorsGuard(reflector);

    expect(guard.canActivate(createContext(undefined, ['financeiro'], ['viewer'], 'financeiro'))).toBe(true);
  });
});
