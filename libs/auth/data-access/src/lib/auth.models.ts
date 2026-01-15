import { AuthUser } from '@flex-erp/auth/types';

export interface AuthStateModel {
  user: AuthUser | null;
  accessToken: string | null;
  accessTokenExpiresAt: string | null; // ISO
  loading: boolean;
  error: string | null;
}
