import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';

import { CsrfMiddleware } from './middleware/csrf.middleware';
import { RedisConnectionService } from './redis-connection.service';

@Module({
  providers: [RedisConnectionService],
  exports: [RedisConnectionService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CsrfMiddleware)
      .exclude(
        { path: 'health', method: RequestMethod.GET },
        { path: 'docs', method: RequestMethod.GET },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/forgot-password', method: RequestMethod.POST },
        { path: 'auth/reset-password', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'auth/logout', method: RequestMethod.POST },
        { path: 'auth/totp/login', method: RequestMethod.POST },
        { path: 'auth/totp/setup', method: RequestMethod.POST },
        { path: 'auth/totp/verify', method: RequestMethod.POST },
        { path: 'auth/totp/disable', method: RequestMethod.POST },
        { path: 'auth/sessions/revoke-all', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
