import { UnauthorizedException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let service: any;
  let controller: UserController;

  beforeEach(() => {
    service = {
      getUser: jest.fn(),
      getUsers: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as UserService;
    controller = new UserController(service as UserService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when no authenticated user is present', async () => {
    await expect(controller.getUser({} as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws when authenticated user cannot be found', async () => {
    service.getUser.mockResolvedValue(null);
    await expect(controller.getUser({ user: { id: 'u1' } } as any)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns sanitized current user', async () => {
    service.getUser.mockResolvedValue({ id: 'u1', email: 'u@test.com', passwordHash: 'hash' });
    const result = await controller.getUser({ user: { id: 'u1' } } as any);
    expect(result).toEqual({ id: 'u1', email: 'u@test.com' });
  });

  it('returns sanitized list of users', async () => {
    service.getUsers.mockResolvedValue([
      { id: 'u1', email: 'a@test.com', passwordHash: 'h1' },
      { id: 'u2', email: 'b@test.com', passwordHash: 'h2' },
    ]);
    const result = await controller.getUsers();
    expect(result).toEqual([
      { id: 'u1', email: 'a@test.com' },
      { id: 'u2', email: 'b@test.com' },
    ]);
  });

  it('updates users and strips password', async () => {
    service.updateUser.mockResolvedValue({ id: 'u1', email: 'new@test.com', passwordHash: 'h' });
    const result = await controller.updateUser({ id: 'u1', email: 'new@test.com' } as any);
    expect(service.updateUser).toHaveBeenCalledWith({ where: { id: 'u1' }, data: { id: 'u1', email: 'new@test.com' } });
    expect(result).toEqual({ id: 'u1', email: 'new@test.com' });
  });

  it('deletes users and strips password', async () => {
    service.deleteUser.mockResolvedValue({ id: 'u1', email: 'old@test.com', passwordHash: 'h' });
    const result = await controller.deleteUser({ user: {} } as any, 'u1');
    expect(service.deleteUser).toHaveBeenCalledWith({ id: 'u1' });
    expect(result).toEqual({ id: 'u1', email: 'old@test.com' });
  });

  it('sanitizes null users safely', async () => {
    expect((controller as any).sanitizeUser(null)).toBeNull();
  });
});
