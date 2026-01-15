import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '@flex-erp/auth/util';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthApiService,
        { provide: API_BASE_URL, useValue: 'http://api.example.com' },
      ],
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should login with email and password', () => {
    service.login('john@example.com', 'secret').subscribe();
    const req = httpMock.expectOne('http://api.example.com/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ email: 'john@example.com', password: 'secret' });
    req.flush(null);
  });

  it('should refresh tokens', () => {
    service.refresh().subscribe();
    const req = httpMock.expectOne('http://api.example.com/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush(null);
  });

  it('should call me endpoint', () => {
    service.me().subscribe();
    const req = httpMock.expectOne('http://api.example.com/auth/me');
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush(null);
  });

  it('should logout', () => {
    service.logout().subscribe();
    const req = httpMock.expectOne('http://api.example.com/auth/logout');
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ ok: true });
  });
});
