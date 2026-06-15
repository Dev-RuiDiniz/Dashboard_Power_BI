import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';

import { CsrfMiddleware } from './middleware/csrf.middleware';

@Module({})
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
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
