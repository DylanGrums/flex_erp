import { PrismaService } from './prisma.service';

jest.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: jest.fn().mockImplementation((opts) => ({ ...opts, kind: 'pg-adapter' })),
  };
});

jest.mock(
  'generated/prisma/client',
  () => {
    return {
      PrismaClient: class {
        public opts: any;
        public $connect = jest.fn();
        constructor(opts: any) {
          this.opts = opts;
        }
      },
    };
  },
  { virtual: true },
);

describe('PrismaService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, DATABASE_URL: 'postgres://user:pass@localhost/db' };
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('constructs Prisma client with pg adapter and connects on module init', async () => {
    const service = new PrismaService() as any;

    expect(service.opts.adapter).toEqual({ connectionString: 'postgres://user:pass@localhost/db', kind: 'pg-adapter' });

    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalledTimes(1);
  });
});
