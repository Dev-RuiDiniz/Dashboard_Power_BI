import { Module } from '@nestjs/common';

import { SupabaseModule } from '../supabase/supabase.module';
import { AuthController } from './auth.controller';
import { AuthzTestController } from './authz-test.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SectorsGuard } from './guards/sectors.guard';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { UsersRepository } from './repositories/users.repository';
import { EmailService } from './services/email.service';
import { LoginAttemptsService } from './services/login-attempts.service';
import { PasswordResetService } from './services/password-reset.service';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { TokenService } from './services/token.service';
import { TotpService } from './services/totp.service';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController, AuthzTestController],
  providers: [
    AuthService,
    UsersRepository,
    RefreshTokenRepository,
    PasswordResetTokenRepository,
    LoginAttemptsService,
    PasswordResetService,
    EmailService,
    TokenService,
    TotpService,
    TokenBlacklistService,
    JwtAuthGuard,
    RolesGuard,
    SectorsGuard,
  ],
  exports: [
    AuthService,
    UsersRepository,
    RefreshTokenRepository,
    PasswordResetService,
    LoginAttemptsService,
    EmailService,
    TokenService,
    TotpService,
    TokenBlacklistService,
    JwtAuthGuard,
    RolesGuard,
    SectorsGuard,
  ],
})
export class AuthModule {}
