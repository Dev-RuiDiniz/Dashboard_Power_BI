import { Body, Controller, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetService } from './services/password-reset.service';
import { AuthTokens } from './types/auth.types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica usuário e emite access token e refresh token.' })
  @ApiOkResponse({ description: 'Autenticação realizada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  @ApiTooManyRequestsResponse({ description: 'Muitas tentativas de login. Tente novamente mais tarde.' })
  login(@Body() body: LoginDto, @Req() request: Request): Promise<AuthTokens> {
    return this.authService.login(body.email, body.password, this.getClientIp(request));
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicita envio de instruções para recuperação de senha.' })
  @ApiOkResponse({ description: 'Resposta genérica enviada para evitar enumeração de usuários.' })
  forgotPassword(@Body() body: ForgotPasswordDto): Promise<{ success: true; message: string }> {
    return this.passwordResetService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redefine senha usando token temporário de recuperação.' })
  @ApiOkResponse({ description: 'Senha redefinida com sucesso.' })
  resetPassword(@Body() body: ResetPasswordDto): Promise<{ success: true }> {
    return this.passwordResetService.resetPassword(body.token, body.newPassword);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotaciona refresh token e emite novo par de tokens.' })
  @ApiOkResponse({ description: 'Tokens rotacionados com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido.' })
  refresh(@Body() body: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalida o refresh token atual.' })
  @ApiOkResponse({ description: 'Logout realizado com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido.' })
  logout(@Body() body: LogoutDto): Promise<{ success: true }> {
    return this.authService.logout(body.refreshToken);
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
    }

    if (Array.isArray(forwardedFor) && forwardedFor[0]) {
      return forwardedFor[0].trim();
    }

    return request.ip ?? request.socket.remoteAddress ?? 'unknown';
  }
}
