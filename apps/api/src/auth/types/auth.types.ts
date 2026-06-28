export type UserRole = 'viewer' | 'downloader' | 'admin';

export type SectorCode = 'financeiro' | 'comercial' | 'operacoes' | 'diretoria';

export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  roles: UserRole[];
  sectors: SectorCode[];
  groupIds: string[];
  isActive: boolean;
  totpSecret: string | null;
  isTwoFactorEnabled: boolean;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  deactivatedAt: Date | null;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  roles: UserRole[];
  sectors: SectorCode[];
  jti: string;
  tv: number;
};

export type TotpPendingPayload = {
  sub: string;
  type: 'totp_pending';
  iat: number;
  exp: number;
};

export type AuthenticatedRequestUser = AuthTokenPayload;

export type RevokeSessionsRequest = {
  userId?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  jti: string;
};

export type RefreshSession = {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
};
