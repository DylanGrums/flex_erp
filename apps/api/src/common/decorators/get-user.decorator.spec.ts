jest.mock('@nestjs/common', () => {
  return {
    createParamDecorator: (fn: any) => fn,
    ExecutionContext: class {},
  };
});
import { ExecutionContext } from '@nestjs/common';
import { GetUser } from './get-user.decorator';

describe('GetUser decorator', () => {
  const makeCtx = (user: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext);

  it('returns user from request', () => {
    const ctx = makeCtx({ id: 'u1' });
    expect((GetUser as any)(null, ctx)).toEqual({ id: 'u1' });
  });

  it('returns undefined when no user is set', () => {
    const ctx = makeCtx(undefined);
    expect((GetUser as any)(null, ctx)).toBeUndefined();
  });
});
