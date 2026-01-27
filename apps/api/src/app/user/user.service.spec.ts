import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn((value: string) => Promise.resolve(`hashed-${value}`)),
  compare: jest.fn((value: string, hashed: string) =>
    Promise.resolve(hashed === `hashed-${value}`),
  ),
}));

describe('UserService', () => {
  const originalEnv = process.env;
  let prisma: any;
  let service: UserService;

  beforeEach(() => {
    process.env = { ...originalEnv };
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    service = new UserService(prisma as any, { get: jest.fn() } as any);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('returns users via getUser and getUsers', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    prisma.user.findMany.mockResolvedValue([{ id: 'u1' }, { id: 'u2' }]);

    expect(await service.getUser({ id: 'u1' })).toEqual({ id: 'u1' });
    expect(await service.getUsers()).toEqual([{ id: 'u1' }, { id: 'u2' }]);
  });

  it('creates users hashing password', async () => {
    process.env.BCRYPT_ROUNDS = '5';
    const created = { id: 'u1', email: 'u@test.com' };
    prisma.user.create.mockResolvedValue(created);

    const result = await service.create({
      tenantId: 't1',
      email: 'u@test.com',
      password: 'secret',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 5);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        tenantId: 't1',
        email: 'u@test.com',
        passwordHash: 'hashed-secret',
      },
    });
    expect(result).toEqual(created);
  });

  it('updates and deletes users', async () => {
    prisma.user.update.mockResolvedValue({ id: 'u1', email: 'new@test.com' });
    prisma.user.delete.mockResolvedValue({ id: 'u1' });

    expect(
      await service.updateUser({
        where: { id: 'u1' },
        data: { email: 'new@test.com' },
      }),
    ).toEqual({ id: 'u1', email: 'new@test.com' });
    expect(prisma.user.update).toHaveBeenCalledWith({
      data: { email: 'new@test.com' },
      where: { id: 'u1' },
    });

    expect(await service.deleteUser({ id: 'u1' })).toEqual({ id: 'u1' });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
  });

  it('validates credentials with bcrypt and active users only', async () => {
    await expect(service.validatePassword('', '')).rejects.toThrow(
      'Email and password are required',
    );

    prisma.user.findFirst.mockResolvedValueOnce(null);
    expect(await service.validatePassword('none@test.com', 'pass')).toBeNull();

    prisma.user.findFirst.mockResolvedValueOnce({
      id: 'u1',
      passwordHash: 'hashed-pass',
      status: 'DISABLED',
    });
    expect(
      await service.validatePassword('inactive@test.com', 'pass'),
    ).toBeNull();

    prisma.user.findFirst.mockResolvedValueOnce({
      id: 'u2',
      passwordHash: 'hashed-other',
      status: 'ACTIVE',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    expect(await service.validatePassword('u2@test.com', 'pass')).toBeNull();

    prisma.user.findFirst.mockResolvedValueOnce({
      id: 'u3',
      passwordHash: 'hashed-pass',
      status: 'ACTIVE',
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    const valid = await service.validatePassword('u3@test.com', 'pass');
    expect(valid).toMatchObject({
      id: 'u3',
      passwordHash: 'hashed-pass',
      isActive: true,
      role: 'USER',
    });
  });

  it('finds by email and id', async () => {
    prisma.user.findFirst.mockResolvedValueOnce({ id: 'u1' });
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'u2' });

    await service.findByEmail('a@test.com');
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { email: 'a@test.com' },
      include: { roles: { include: { role: true } } },
    });

    await service.findById('u2');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u2' },
      include: { roles: { include: { role: true } } },
    });
  });
});
