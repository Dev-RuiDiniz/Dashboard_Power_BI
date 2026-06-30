import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangeMyPasswordDto } from './dto/change-my-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RevokeSessionsDto } from './dto/revoke-sessions.dto';
import { TotpDisableDto, TotpLoginDto, TotpVerifyDto } from './dto/totp-setup.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PasswordResetService } from './services/password-reset.service';
import { AuthenticatedRequestUser, AuthTokens } from './types/auth.types';
import { LoginResult } from './auth.service';

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
  @ApiTooManyRequestsResponse({
    description: 'Muitas tentativas de login. Tente novamente mais tarde.',
  })
  login(@Body() body: LoginDto, @Req() request: Request): Promise<LoginResult> {
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
  @ApiOperation({ summary: 'Invalida o refresh token e blacklist o access token.' })
  @ApiOkResponse({ description: 'Logout realizado com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Refresh token inválido.' })
  logout(
    @Body() body: LogoutDto,
    @Req() request: Request & { user?: AuthenticatedRequestUser },
  ): Promise<{ success: true }> {
    const accessToken = request.headers.authorization?.replace('Bearer ', '').trim();
    let accessTokenJti: string | undefined;
    let accessTokenExp: number | undefined;

    if (accessToken) {
      try {
        const parts = accessToken.split('.');
        const encodedPayload = parts[1];
        if (parts.length === 3 && encodedPayload) {
          const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
          accessTokenJti = payload.jti;
          accessTokenExp = payload.exp;
        }
      } catch {
        // ignore — best effort
      }
    }

    return this.authService.logout(body.refreshToken, accessTokenJti, accessTokenExp);
  }

  @Post('sessions/revoke-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoga todas as sessões do usuário (access + refresh tokens).' })
  @ApiOkResponse({ description: 'Todas as sessões revogadas com sucesso.' })
  revokeAllSessions(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() body: RevokeSessionsDto,
  ): Promise<{ success: true }> {
    const targetUserId = body.userId ?? user.sub;

    if (targetUserId !== user.sub && !user.roles.includes('admin')) {
      throw new ForbiddenException(
        'Apenas administradores podem revogar sessões de outros usuários.',
      );
    }

    return this.authService.revokeAllSessions(targetUserId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna o usuário autenticado.' })
  @ApiOkResponse({ description: 'Perfil do usuário autenticado retornado com sucesso.' })
  me(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.authService.getCurrentUser(user.sub);
  }

  @Patch('me/password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza a senha do usuário autenticado.' })
  @ApiOkResponse({ description: 'Senha atualizada com sucesso.' })
  changeMyPassword(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() body: ChangeMyPasswordDto,
  ): Promise<{ success: true }> {
    return this.authService.changePassword(user.sub, body.currentPassword, body.newPassword);
  }

  @Post('totp/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Completa login com código TOTP e emite tokens.' })
  @ApiOkResponse({ description: 'Autenticação concluída com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Código ou token temporário inválido.' })
  totpLogin(@Body() body: TotpLoginDto): Promise<AuthTokens> {
    return this.authService.totpLogin(body.tempToken, body.code);
  }

  @Post('totp/setup')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia configuração de 2FA/TOTP.' })
  @ApiOkResponse({ description: 'Secret e URL otpauth retornados para exibir QR code.' })
  setupTotp(
    @CurrentUser() user: AuthenticatedRequestUser,
  ): Promise<{ secret: string; otpauthUrl: string }> {
    return this.authService.setupTotp(user.sub);
  }

  @Post('totp/verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifica código e ativa 2FA/TOTP.' })
  @ApiOkResponse({ description: '2FA ativado com sucesso.' })
  verifyTotp(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() body: TotpVerifyDto,
  ): Promise<{ enabled: true }> {
    return this.authService.verifyTotpSetup(user.sub, body.code);
  }

  @Post('totp/disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desativa 2FA/TOTP com verificação de código.' })
  @ApiOkResponse({ description: '2FA desativado com sucesso.' })
  disableTotp(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() body: TotpDisableDto,
  ): Promise<{ disabled: true }> {
    return this.authService.disableTotp(user.sub, body.code, body.password);
  }

  private getClientIp(request: Request): string {
    return request.ip ?? request.socket.remoteAddress ?? 'unknown';
  }
}
