import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { Store } from '@ngxs/store';

import { AuthState } from '@flex-erp/auth/data-access';
import { contextInterceptor } from './context.interceptor';
import { ContextState } from './context.state';

describe('contextInterceptor', () => {
  let storeMock: { selectSnapshot: jest.Mock; dispatch: jest.Mock };

  beforeEach(() => {
    storeMock = { selectSnapshot: jest.fn(), dispatch: jest.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: Store, useValue: storeMock }],
    });
  });

  it('adds store and tenant headers when present', async () => {
    storeMock.selectSnapshot.mockImplementation((selector) => {
      if (selector === ContextState.storeId) {
        return 'store-1';
      }
      if (selector === ContextState.tenantId) {
        return 'tenant-1';
      }
      if (selector === AuthState.user) {
        return null;
      }
      return null;
    });

    const next = jest.fn((req) => of(req));
    const req = new HttpRequest('GET', '/api/orders');

    const handled = await TestBed.runInInjectionContext(() =>
      firstValueFrom(contextInterceptor(req, next)),
    );

    expect(handled.headers.get('X-Store-Id')).toBe('store-1');
    expect(handled.headers.get('X-Tenant-Id')).toBe('tenant-1');
  });

  it('skips headers when context empty', async () => {
    storeMock.selectSnapshot.mockReturnValue(null);
    const next = jest.fn((req) => of(req));
    const req = new HttpRequest('GET', '/api/orders');

    const handled = await TestBed.runInInjectionContext(() =>
      firstValueFrom(contextInterceptor(req, next)),
    );

    expect(handled.headers.has('X-Store-Id')).toBe(false);
    expect(handled.headers.has('X-Tenant-Id')).toBe(false);
  });

  it('falls back to auth user tenant when context tenant missing', async () => {
    storeMock.selectSnapshot.mockImplementation((selector) => {
      if (selector === ContextState.storeId) {
        return 'store-1';
      }
      if (selector === ContextState.tenantId) {
        return null;
      }
      if (selector === AuthState.user) {
        return { tenantId: 'tenant-2' };
      }
      return null;
    });

    const next = jest.fn((req) => of(req));
    const req = new HttpRequest('GET', '/api/orders');

    const handled = await TestBed.runInInjectionContext(() =>
      firstValueFrom(contextInterceptor(req, next)),
    );

    expect(handled.headers.get('X-Store-Id')).toBe('store-1');
    expect(handled.headers.get('X-Tenant-Id')).toBe('tenant-2');
  });
});
