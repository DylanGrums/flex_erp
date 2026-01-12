import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from 'generated/prisma/client';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService
  ) { }  

  async getUser(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where,
    });
  }

  async getUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async create(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12);
    const passwordHash = await bcrypt.hash(data.password, rounds);
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.USER,
        isActive: true,
        firstName: data.firstName ?? '',
        lastName: data.lastName ?? '',
      },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async validatePassword(email: string, password: string) {
    // Throw error if no email/password 
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    const user = await this.findByEmail(email);
    if (!user || !user.isActive) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }
}
