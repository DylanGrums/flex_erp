export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthLoginRequest = AuthCredentials;

export type AuthRegisterRequest = {
  email: string;
  username: string;
  password: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role?: string;
  avatar?: string | null;
  firstName?: string;
  lastName?: string;
};

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: string;
  type: 'access';
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
  type: 'refresh';
};

export type JwtPayload = AuthTokenPayload | RefreshTokenPayload;

export type AuthTokenResponse = {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: AuthUser;
};

export type AuthLoginResponse = AuthTokenResponse;
export type AuthRefreshResponse = AuthTokenResponse;
export type AuthLogoutResponse = { ok: true };
export type AuthMeResponse = AuthUser;
