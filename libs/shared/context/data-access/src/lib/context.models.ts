export type AppContext = {
  tenantId: string | null;
  storeId: string | null;
};

export type TenantStore = {
  id: string;
  code: string;
  name: string;
};

export type ContextStateModel = {
  ctx: AppContext;
  hydrated: boolean;
  stores: TenantStore[];
  storesLoading: boolean;
  storesError: string | null;
};
