import { TenantStore } from './context.models';

export class HydrateFromStorage {
  static readonly type = '[Context] Hydrate From Storage';
}

export class LoadStores {
  static readonly type = '[Context] Load Stores';
}

export class LoadStoresSuccess {
  static readonly type = '[Context] Load Stores Success';
  constructor(public stores: TenantStore[]) {}
}

export class LoadStoresFailed {
  static readonly type = '[Context] Load Stores Failed';
  constructor(public error: string) {}
}

export class SetStoreId {
  static readonly type = '[Context] Set Store Id';

  constructor(public storeId: string | null) {}
}

export class SetTenantId {
  static readonly type = '[Context] Set Tenant Id';

  constructor(public tenantId: string | null) {}
}

export class ClearContext {
  static readonly type = '[Context] Clear';
}
