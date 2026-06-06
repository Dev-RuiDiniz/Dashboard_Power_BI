import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

declare global {
  namespace Express {
    interface Request {
      csrfToken?: string;
    }
  }
}

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly tokenLength = 32;
  private readonly cookieName = 'csrf-token';
  private readonly headerName = 'x-csrf-token';

  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      // Generate or retrieve CSRF token
      let token = req.cookies?.[this.cookieName];

      if (!token) {
        token = this.generateToken();
        res.cookie(this.cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 3600000, // 1 hour
        });
      }

      req.csrfToken = token;
      return next();
    }

    // Validate CSRF token for state-changing requests
    const token = req.cookies?.[this.cookieName];
    const headerToken = req.headers[this.headerName] as string;

    if (!token || !headerToken || token !== headerToken) {
      throw new ForbiddenException('CSRF token inválido ou ausente.');
    }

    req.csrfToken = token;
    next();
  }

  private generateToken(): string {
    return randomBytes(this.tokenLength).toString('hex');
  }
}
