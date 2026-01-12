import { Controller, Get, UseGuards, Req, Param, Body, Put, Delete, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import 'moment-timezone';
import { Prisma } from 'generated/prisma/client';

@Controller('users')
export class UserController {
  constructor(private _userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Get('connected/')
  async getUser(@Req() req) {
    if (!req.user) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this._userService.getUser({ id: req.user.id });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.sanitizeUser(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/')
  async getUsers() {
    const users = await this._userService.getUsers();
    return users.map((u) => this.sanitizeUser(u));
  }

  @UseGuards(JwtAuthGuard)
  @Put('/')
  async updateUser(@Body() user: Prisma.UserUpdateInput) {
    const updated = await this._userService.updateUser({ where: { id: user.id as string }, data: user });
    return this.sanitizeUser(updated);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteUser(@Req() req, @Param('id') id: string) {
    const removed = await this._userService.deleteUser({ id: id });
    return this.sanitizeUser(removed);
  }

  private sanitizeUser(user: any) {
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
