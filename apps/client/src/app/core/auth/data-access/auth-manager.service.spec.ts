import { TestBed } from '@angular/core/testing';
import { AuthManagerService } from './auth-manager.service';
import { ApiHelperService } from '../../../shared/services/api-helper.service';

describe('AuthManagerService', () => {
  let service: AuthManagerService;
  const apiHelperMock = {
    post: jest.fn(),
    get: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthManagerService,
        { provide: ApiHelperService, useValue: apiHelperMock },
      ],
    });
    service = TestBed.inject(AuthManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login with email and password', () => {
    apiHelperMock.post.mockReturnValue('login$');
    const result = service.login('john@example.com', 'secret');
    expect(apiHelperMock.post).toHaveBeenCalledWith('/auth/login', {
      email: 'john@example.com',
      password: 'secret',
    });
    expect(result).toBe('login$');
  });

  it('should refresh and map response', () => {
    apiHelperMock.post.mockReturnValue('refresh$');
    const result = service.refresh();
    expect(apiHelperMock.post).toHaveBeenCalledWith('/auth/refresh', {});
    expect(result).toBe('refresh$');
  });

  it('should call me endpoint', () => {
    apiHelperMock.get.mockReturnValue('me$');
    const result = service.me();
    expect(apiHelperMock.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toBe('me$');
  });

  it('should logout via api helper', () => {
    apiHelperMock.post.mockReturnValue('logout$');
    const result = service.logout();
    expect(apiHelperMock.post).toHaveBeenCalledWith('/auth/logout', {});
    expect(result).toBe('logout$');
  });
});
