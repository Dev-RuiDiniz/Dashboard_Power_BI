export type UserRole = 'viewer' | 'downloader' | 'admin';

export type SectorCode = 'financeiro' | 'comercial' | 'operacoes' | 'diretoria';

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  sectors: SectorCode[];
  isActive: boolean;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  roles: UserRole[];
  sectors: SectorCode[];
};

export type AuthenticatedRequestUser = AuthTokenPayload;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

export type RefreshSession = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
};
