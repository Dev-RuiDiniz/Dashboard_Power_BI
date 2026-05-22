import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { SECTORS_KEY } from '../decorators/sectors.decorator';
import { AuthenticatedRequestUser, SectorCode } from '../types/auth.types';

@Injectable()
export class SectorsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const staticSectors = this.reflector.getAllAndOverride<SectorCode[]>(SECTORS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request & { params?: Record<string, string>; user?: AuthenticatedRequestUser }>();
    const sectorParam = request.params?.sector as SectorCode | undefined;
    const requiredSectors = staticSectors?.length ? staticSectors : sectorParam ? [sectorParam] : [];

    if (!requiredSectors.length) {
      return true;
    }

    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário autenticado não encontrado no contexto.');
    }

    if (user.roles.includes('admin')) {
      return true;
    }

    const hasSector = requiredSectors.some((sector) => user.sectors.includes(sector));

    if (!hasSector) {
      throw new ForbiddenException('Usuário sem permissão para acessar este setor.');
    }

    return true;
  }
}
