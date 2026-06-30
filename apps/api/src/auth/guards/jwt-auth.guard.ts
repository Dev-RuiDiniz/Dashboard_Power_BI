import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { UsersRepository } from '../repositories/users.repository';
import { TokenBlacklistService } from '../services/token-blacklist.service';
import { TokenService } from '../services/token.service';
import { AuthenticatedRequestUser } from '../types/auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedRequestUser }>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token não informado.');
    }

    const token = authorization.replace('Bearer ', '').trim();
    const payload = this.tokenService.verifyAccessToken(token);

    if (payload.jti && (await this.tokenBlacklistService.isBlacklisted(payload.jti))) {
      throw new UnauthorizedException('Token revogado.');
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário inválido ou desativado.');
    }

    if (payload.tv !== undefined && payload.tv !== user.tokenVersion) {
      throw new UnauthorizedException('Token inválido por rotação de sessão.');
    }

    request.user = {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
      sectors: payload.sectors,
      jti: payload.jti,
      tv: payload.tv,
    };

    return true;
  }
}
