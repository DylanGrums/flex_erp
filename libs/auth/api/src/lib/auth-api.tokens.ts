export type AuthUserService = {
  validatePassword(email: string, password: string): Promise<any>;
  updateUser(args: {
    where: { id: string };
    data: { lastLoginAt: Date };
  }): Promise<any>;
  findById(id: string): Promise<any>;
};

export type AuthPrismaClient = {
  user: {
    findUnique(args: { where: { id: string }; include?: any }): Promise<any>;
  };
  authSession: {
    create(args: any): Promise<any>;
    findUnique(args: any): Promise<any>;
    delete(args: any): Promise<any>;
    deleteMany(args: any): Promise<any>;
  };
  $transaction<T>(cb: (tx: AuthPrismaClient) => Promise<T>): Promise<T>;
};

export const AUTH_USER_SERVICE = Symbol('AUTH_USER_SERVICE');
export const AUTH_PRISMA = Symbol('AUTH_PRISMA');
