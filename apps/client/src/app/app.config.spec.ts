import { APP_INITIALIZER } from '@angular/core';
import { of, throwError } from 'rxjs';
import { appConfig } from './app.config';
import { Refresh } from '@flex-erp/auth/data-access';
import { API_BASE_URL } from '@flex-erp/auth/util';
import { environment } from '../environments/environment';

describe('appConfig', () => {
  it('provides API base url from environment', () => {
    const apiProvider = (appConfig.providers as any[]).find(
      (p) => p?.provide === API_BASE_URL,
    );
    expect(apiProvider).toBeDefined();
    expect(apiProvider.useValue).toBe(environment.apiBaseUrl);
  });

  it('runs Refresh on application init and ignores errors', async () => {
    const initializer = (appConfig.providers as any[]).find(
      (p) => p?.provide === APP_INITIALIZER,
    );
    expect(initializer).toBeDefined();

    const storeMock = {
      dispatch: jest.fn().mockReturnValue(of(null)),
    };

    const initFn = (initializer as any).useFactory(storeMock);
    await expect(initFn()).resolves.toBeNull();
    expect(storeMock.dispatch).toHaveBeenCalledWith(new Refresh());

    storeMock.dispatch.mockReturnValueOnce(throwError(() => new Error('fail')));
    const initFnWithError = (initializer as any).useFactory(storeMock);
    await expect(initFnWithError()).resolves.toBeNull();
  });
});
