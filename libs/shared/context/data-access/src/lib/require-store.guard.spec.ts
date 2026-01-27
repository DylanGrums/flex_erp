import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';

import { HydrateFromStorage } from './context.actions';
import { ContextState } from './context.state';
import { requireStoreGuard } from './require-store.guard';

describe('requireStoreGuard', () => {
  let storeMock: { selectSnapshot: jest.Mock; dispatch: jest.Mock };
  let routerMock: { createUrlTree: jest.Mock };

  beforeEach(() => {
    storeMock = { selectSnapshot: jest.fn(), dispatch: jest.fn() };
    routerMock = { createUrlTree: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('hydrates and allows navigation when not hydrated', () => {
    storeMock.selectSnapshot.mockImplementation((selector) => {
      if (selector === ContextState.hydrated) {
        return false;
      }
      return null;
    });

    const result = TestBed.runInInjectionContext(() =>
      requireStoreGuard({} as any, { url: '/orders' } as any),
    );

    expect(storeMock.dispatch).toHaveBeenCalledWith(new HydrateFromStorage());
    expect(result).toBe(true);
  });

  it('redirects to default route when store missing', () => {
    storeMock.selectSnapshot.mockImplementation((selector) => {
      if (selector === ContextState.hydrated) {
        return true;
      }
      if (selector === ContextState.storeId) {
        return null;
      }
      return null;
    });
    routerMock.createUrlTree.mockReturnValue({ tree: true });

    const result = TestBed.runInInjectionContext(() =>
      requireStoreGuard({} as any, { url: '/orders' } as any),
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/orders'], {
      queryParams: { missingStore: 1, returnUrl: '/orders' },
    });
    expect(result).toEqual({ tree: true });
  });

  it('allows navigation on missing-store safe route', () => {
    storeMock.selectSnapshot.mockImplementation((selector) => {
      if (selector === ContextState.hydrated) {
        return true;
      }
      if (selector === ContextState.storeId) {
        return null;
      }
      return null;
    });

    const result = TestBed.runInInjectionContext(() =>
      requireStoreGuard({} as any, { url: '/orders?missingStore=1' } as any),
    );

    expect(result).toBe(true);
  });

  it('allows navigation when store is set', () => {
    storeMock.selectSnapshot.mockImplementation((selector) => {
      if (selector === ContextState.hydrated) {
        return true;
      }
      if (selector === ContextState.storeId) {
        return 'store-1';
      }
      return null;
    });

    const result = TestBed.runInInjectionContext(() =>
      requireStoreGuard({} as any, { url: '/orders' } as any),
    );

    expect(result).toBe(true);
  });
});
