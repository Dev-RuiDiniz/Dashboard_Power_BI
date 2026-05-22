import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { AuthenticatedRequestUser } from '../types/auth.types';

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthenticatedRequestUser | undefined => {
  const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedRequestUser }>();

  return request.user;
});
