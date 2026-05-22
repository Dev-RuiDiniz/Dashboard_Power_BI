import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersRepository } from './repositories/users.repository';
import { TokenService } from './services/token.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, RefreshTokenRepository, TokenService],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
