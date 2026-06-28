import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomUUID } from 'node:crypto';

import { AuthTokenPayload, TotpPendingPayload } from '../types/auth.types';

type JwtPayload = AuthTokenPayload & {
  iat: number;
  exp: number;
};

type TotpPendingJwtPayload = TotpPendingPayload;

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  createAccessToken(payload: AuthTokenPayload): { token: string; expiresIn: number; jti: string } {
    const expiresIn = Number(this.configService.get<number>('JWT_ACCESS_EXPIRES_IN_SECONDS', 900));
    const now = Math.floor(Date.now() / 1000);
    const jti = randomUUID();
    const jwtPayload: JwtPayload = {
      ...payload,
      jti,
      iat: now,
      exp: now + expiresIn,
    };

    return {
      token: this.sign(jwtPayload),
      expiresIn,
      jti,
    };
  }

  verifyAccessToken(token: string): JwtPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Token inválido.');
    }

    const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Token inválido.');
    }

    const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JwtPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expirado.');
    }

    return payload;
  }

  createTotpPendingToken(userId: string): { token: string; expiresIn: number } {
    const expiresIn = 300; // 5 minutos
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload: TotpPendingJwtPayload = {
      sub: userId,
      type: 'totp_pending',
      iat: now,
      exp: now + expiresIn,
    };

    return {
      token: this.sign(jwtPayload as unknown as JwtPayload),
      expiresIn,
    };
  }

  verifyTotpPendingToken(token: string): TotpPendingJwtPayload {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
      throw new UnauthorizedException('Token inválido.');
    }

    const expectedSignature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Token inválido.');
    }

    const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as TotpPendingJwtPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expirado.');
    }

    if (payload.type !== 'totp_pending') {
      throw new UnauthorizedException('Token inválido.');
    }

    return payload;
  }

  private sign(payload: JwtPayload): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.createSignature(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private createSignature(value: string): string {
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET');

    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET não configurado.');
    }

    return createHmac('sha256', secret).update(value).digest('base64url');
  }

  private base64UrlEncode(value: string): string {
    return Buffer.from(value).toString('base64url');
  }

  private base64UrlDecode(value: string): string {
    return Buffer.from(value, 'base64url').toString('utf8');
  }
}
