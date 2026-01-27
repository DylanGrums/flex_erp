declare module 'generated/prisma/client' {
  export namespace Prisma {
    export type UserWhereUniqueInput = any;
    export type UserUpdateInput = any;
  }

  export interface User {
    id: string;
    tenantId: string;
    email: string;
    passwordHash: string;
    status: 'ACTIVE' | 'DISABLED';
    lastLoginAt?: Date | null;
  }

  export interface AuthSession {
    id: string;
    tenantId: string;
    userId: string;
    refreshTokenHash: string;
    expiresAt: Date;
  }

  export class PrismaClient {
    user: any;
    authSession: any;
    $transaction: any;
    $connect: any;
    constructor(...args: any[]);
  }
}
