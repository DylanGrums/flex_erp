import { Controller, Get, Headers, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { StoresService } from './stores.service';

@UseGuards(AuthGuard('jwt'))
@Controller('stores')
export class StoresController {
  constructor(private readonly stores: StoresService) {}

  @Get()
  async list(@Headers('x-tenant-id') tenantId: string | undefined) {
    if (!tenantId) throw new UnauthorizedException();
    return this.stores.listByTenant(tenantId);
  }
}
