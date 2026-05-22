import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

import { TokenService } from '../services/token.service';
import { AuthenticatedRequestUser } from '../types/auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedRequestUser }>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Access token não informado.');
    }

    const token = authorization.replace('Bearer ', '').trim();
    const payload = this.tokenService.verifyAccessToken(token);

    request.user = {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
      sectors: payload.sectors,
    };

    return true;
  }
}
