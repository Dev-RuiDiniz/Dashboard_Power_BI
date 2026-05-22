import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'node:crypto';

import { AuthTokenPayload } from '../types/auth.types';

type JwtPayload = AuthTokenPayload & {
  iat: number;
  exp: number;
};

@Injectable()
export class TokenService {
  constructor(private readonly configService: ConfigService) {}

  createAccessToken(payload: AuthTokenPayload): { token: string; expiresIn: number } {
    const expiresIn = Number(this.configService.get<number>('JWT_ACCESS_EXPIRES_IN_SECONDS', 900));
    const now = Math.floor(Date.now() / 1000);
    const jwtPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };

    return {
      token: this.sign(jwtPayload),
      expiresIn,
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
