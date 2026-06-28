import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';

import { UsersRepository } from '../repositories/users.repository';
import { AuthenticatedRequestUser } from '../types/auth.types';

@Injectable()
export class TwoFactorGuard implements CanActivate {
  constructor(private readonly usersRepository: UsersRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedRequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário autenticado não encontrado no contexto.');
    }

    if (!user.roles.includes('admin')) {
      return true;
    }

    const fullUser = await this.usersRepository.findById(user.sub);

    if (!fullUser || !fullUser.isActive) {
      throw new ForbiddenException('Usuário inválido ou inativo.');
    }

    if (!fullUser.isTwoFactorEnabled) {
      throw new ForbiddenException(
        'Autenticação de dois fatores (2FA) é obrigatória para administradores. Ative o 2FA no seu perfil antes de continuar.',
      );
    }

    return true;
  }
}
