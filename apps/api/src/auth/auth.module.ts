import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersRepository } from './repositories/users.repository';
import { EmailService } from './services/email.service';
import { LoginAttemptsService } from './services/login-attempts.service';
import { PasswordResetService } from './services/password-reset.service';
import { TokenService } from './services/token.service';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    RefreshTokenRepository,
    PasswordResetTokenRepository,
    LoginAttemptsService,
    PasswordResetService,
    EmailService,
    TokenService,
  ],
  exports: [AuthService, PasswordResetService, LoginAttemptsService, EmailService, TokenService],
})
export class AuthModule {}
