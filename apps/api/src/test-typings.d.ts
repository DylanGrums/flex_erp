declare module 'generated/prisma/enums' {
  export enum Role {
    ADMIN = 'ADMIN',
    USER = 'USER',
    MANAGER = 'MANAGER',
    ASH = 'ASH',
    NURSE = 'NURSE',
    CAREGIVER = 'CAREGIVER',
  }
}

declare module 'generated/prisma/client' {
  import { Role } from 'generated/prisma/enums';

  export namespace Prisma {
    export type UserWhereUniqueInput = any;
    export type UserUpdateInput = any;
  }

  export interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: Role;
    isActive: boolean;
    avatar?: string | null;
    lastLoginAt?: Date | null;
  }

  export interface RefreshToken {
    id?: string;
    jti: string;
    hashedToken: string;
    userId: string;
    expiresAt: Date;
    revokedAt?: Date | null;
    reasonRevoked?: string | null;
    replacedByToken?: string | null;
    createdByIp?: string | null;
    revokedByIp?: string | null;
    userAgent?: string | null;
  }

  export class PrismaClient {
    user: any;
    refreshToken: any;
    $transaction: any;
    $connect: any;
    constructor(...args: any[]);
  }
}
