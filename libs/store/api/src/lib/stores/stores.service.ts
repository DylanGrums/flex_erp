import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

export type StoreSummary = {
  id: string;
  code: string;
  name: string;
};

@Injectable()
export class StoresService implements OnModuleInit {
  private prisma = new (PrismaClient as any)({
    adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
  }) as any;

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async listByTenant(tenantId: string): Promise<StoreSummary[]> {
    return this.prisma.store.findMany({
      where: { tenantId },
      select: { id: true, code: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
