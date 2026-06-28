import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { EffectivePermissionsService } from '../../permissions/effective-permissions.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { AuthenticatedRequestUser } from '../types/auth.types';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly effectivePermissionsService: EffectivePermissionsService,
    private readonly reflector: Reflector = new Reflector(),
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedRequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário autenticado não encontrado no contexto.');
    }

    if (user.roles.includes('admin')) {
      return true;
    }

    for (const permission of requiredPermissions) {
      const hasPermission = await this.effectivePermissionsService.hasPermission(
        user.sub,
        permission,
      );

      if (hasPermission) {
        return true;
      }
    }

    throw new ForbiddenException('Usuário sem permissão para acessar este recurso.');
  }
}
