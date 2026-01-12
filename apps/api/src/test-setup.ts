const roles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MANAGER: 'MANAGER',
  ASH: 'ASH',
  NURSE: 'NURSE',
  CAREGIVER: 'CAREGIVER',
};

jest.mock(
  'generated/prisma/enums',
  () => ({
    Role: roles,
  }),
  { virtual: true },
);

jest.mock(
  'generated/prisma/client',
  () => {
    class PrismaClient {
      user: any;
      refreshToken: any;
      $transaction: any;
      $connect: any;
      constructor() {
        this.user = {};
        this.refreshToken = {};
        this.$transaction = jest.fn();
        this.$connect = jest.fn();
      }
    }
    return { PrismaClient };
  },
  { virtual: true },
);

export {};
