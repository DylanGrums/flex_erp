import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { Store } from '@ngxs/store';
import { API_BASE_URL } from '../../../tokens';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let storeMock: { selectSnapshot: jest.Mock };

  beforeEach(() => {
    storeMock = { selectSnapshot: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: API_BASE_URL, useValue: 'http://api.example.com' },
      ],
    });
  });

  it('adds authorization header for API requests when token exists', async () => {
    storeMock.selectSnapshot.mockReturnValue('jwt-token');
    const next = jest.fn((req) => of(req));
    const req = new HttpRequest('GET', 'http://api.example.com/users');

    const handled = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authInterceptor(req, next)),
    );

    expect(next).toHaveBeenCalled();
    expect(handled.headers.get('Authorization')).toBe('Bearer jwt-token');
    expect(handled.withCredentials).toBe(true);
  });

  it('avoids modifying non-API requests', async () => {
    storeMock.selectSnapshot.mockReturnValue('jwt-token');
    const next = jest.fn((req) => of(req));
    const req = new HttpRequest('GET', 'http://other.example.com/users');

    const handled = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authInterceptor(req, next)),
    );

    expect(handled.headers.get('Authorization')).toBeNull();
    expect(handled.withCredentials).toBeFalsy();
  });

  it('skips auth header when token missing but preserves API URL', async () => {
    storeMock.selectSnapshot.mockReturnValue(null);
    const next = jest.fn((req) => of(req));
    const req = new HttpRequest('GET', 'http://api.example.com/data');

    const handled = await TestBed.runInInjectionContext(() =>
      firstValueFrom(authInterceptor(req, next)),
    );

    expect(handled.headers.has('Authorization')).toBe(false);
    expect(handled.withCredentials).toBe(true);
  });
});
