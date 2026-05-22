export type AuthUser = {
  id: string;
  email: string;
  passwordHash: string;
  roles: string[];
  isActive: boolean;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  roles: string[];
};

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
