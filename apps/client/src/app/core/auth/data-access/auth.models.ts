import { User } from "generated/prisma/client";

export interface AuthStateModel {
  user: User | null;
  accessToken: string | null;
  accessTokenExpiresAt: string | null; // ISO
  loading: boolean;
  error: string | null;
}
