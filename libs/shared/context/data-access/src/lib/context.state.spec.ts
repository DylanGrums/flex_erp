import { TestBed } from '@angular/core/testing';
import { StateContext } from '@ngxs/store';

import {
  ClearContext,
  HydrateFromStorage,
  LoadStores,
  SetStoreId,
  SetTenantId,
} from './context.actions';
import { ContextState } from './context.state';
import { ContextStateModel } from './context.models';
import { ContextStorage } from './context.storage';
import { ContextApi } from './context.api';

type TestContext = StateContext<ContextStateModel> & { dispatch: jest.Mock };

const DEFAULT_STATE: ContextStateModel = {
  ctx: { tenantId: null, storeId: null },
  hydrated: false,
  stores: [],
  storesLoading: false,
  storesError: null,
};

const createContext = (
  override: Partial<ContextStateModel> = {},
): { ctx: TestContext; latest: () => ContextStateModel } => {
  let current: ContextStateModel = {
    ...DEFAULT_STATE,
    ...override,
    ctx: { ...DEFAULT_STATE.ctx, ...(override.ctx ?? {}) },
  };

  const ctx: TestContext = {
    getState: () => current,
    setState: (val: any) => {
      current = typeof val === 'function' ? val(current) : val;
    },
    patchState: (val: Partial<ContextStateModel>) => {
      current = {
        ...current,
        ...val,
        ctx: { ...current.ctx, ...(val.ctx ?? {}) },
      };
    },
    dispatch: jest.fn(),
    abortSignal: undefined as any,
  };

  return { ctx, latest: () => current };
};

describe('ContextState', () => {
  let storage: { read: jest.Mock; write: jest.Mock; clear: jest.Mock };
  let api: { listStores: jest.Mock };
  let state: ContextState;

  beforeEach(() => {
    storage = {
      read: jest.fn(),
      write: jest.fn(),
      clear: jest.fn(),
    };
    api = {
      listStores: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ContextState,
        { provide: ContextStorage, useValue: storage },
        { provide: ContextApi, useValue: api },
      ],
    });

    state = TestBed.inject(ContextState);
  });

  it('exposes selectors', () => {
    const snapshot: ContextStateModel = {
      ctx: { tenantId: 'tenant-1', storeId: 'store-1' },
      hydrated: true,
      stores: [{ id: 's1', code: 'S1', name: 'Store 1' }],
      storesLoading: false,
      storesError: null,
    };

    expect(ContextState.storeId(snapshot)).toBe('store-1');
    expect(ContextState.tenantId(snapshot)).toBe('tenant-1');
    expect(ContextState.hydrated(snapshot)).toBe(true);
    expect(ContextState.hasStore(snapshot)).toBe(true);
    expect(ContextState.stores(snapshot).length).toBe(1);
    expect(ContextState.storesLoading(snapshot)).toBe(false);
    expect(ContextState.storesError(snapshot)).toBeNull();
  });

  it('hydrates from storage when available', () => {
    const { ctx, latest } = createContext();
    storage.read.mockReturnValue({ tenantId: null, storeId: 'store-9' });

    state.hydrate(ctx);

    expect(storage.read).toHaveBeenCalled();
    expect(latest()).toEqual({
      ctx: { tenantId: null, storeId: 'store-9' },
      hydrated: true,
      stores: [],
      storesLoading: false,
      storesError: null,
    });
  });

  it('hydrates and loads stores when tenant present', () => {
    const { ctx, latest } = createContext();
    storage.read.mockReturnValue({ tenantId: 'tenant-1', storeId: null });

    state.hydrate(ctx);

    expect(latest().ctx.tenantId).toBe('tenant-1');
    expect(ctx.dispatch).toHaveBeenCalledWith(new LoadStores());
  });

  it('marks hydrated even when storage empty', () => {
    const { ctx, latest } = createContext();
    storage.read.mockReturnValue(null);

    state.hydrate(ctx);

    expect(latest()).toEqual({ ...DEFAULT_STATE, hydrated: true });
  });

  it('sets store id and persists', () => {
    const { ctx, latest } = createContext();

    state.setStoreId(ctx, new SetStoreId('store-1'));

    expect(latest().ctx.storeId).toBe('store-1');
    expect(storage.write).toHaveBeenCalledWith({
      tenantId: null,
      storeId: 'store-1',
    });
  });

  it('sets tenant id and persists', () => {
    const { ctx, latest } = createContext({
      ctx: { tenantId: null, storeId: 'store-2' },
    });

    state.setTenantId(ctx, new SetTenantId('tenant-2'));

    expect(latest().ctx.tenantId).toBe('tenant-2');
    expect(storage.write).toHaveBeenCalledWith({
      tenantId: 'tenant-2',
      storeId: 'store-2',
    });
    expect(ctx.dispatch).toHaveBeenCalledWith(new LoadStores());
  });

  it('clears context and storage', () => {
    const { ctx, latest } = createContext({
      ctx: { tenantId: 'tenant-2', storeId: 'store-2' },
      hydrated: true,
    });

    state.clear(ctx);

    expect(latest()).toEqual(DEFAULT_STATE);
    expect(storage.clear).toHaveBeenCalled();
  });
});
