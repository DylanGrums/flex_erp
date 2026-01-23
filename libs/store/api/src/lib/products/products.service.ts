import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  list(_storeId: string, _tenantId: string | null) {
    return [];
  }

  getById(_storeId: string, _id: string, _tenantId: string | null) {
    return null;
  }
}
