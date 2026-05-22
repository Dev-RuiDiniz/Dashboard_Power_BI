import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthTokens } from './types/auth.types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica usuário e emite access token e refresh token.' })
  @ApiOkResponse({ description: 'Autenticação realizada com sucesso.' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas.' })
  login(@Body() body: LoginDto): Promise<AuthTokens> {
    return this.authService.login(body.email, body.password);
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
}
