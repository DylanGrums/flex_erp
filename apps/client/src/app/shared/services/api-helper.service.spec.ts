import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiHelperService } from './api-helper.service';
import { API_BASE_URL } from '../../tokens';

describe('ApiHelperService', () => {
  let service: ApiHelperService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: API_BASE_URL, useValue: 'http://localhost/' }],
    });
    service = TestBed.inject(ApiHelperService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should build urls consistently and expose base url', () => {
    expect(service.getApiURlString()).toBe('http://localhost/');

    let result: any;
    service.get('test/endpoint').subscribe((res) => (result = res));
    const req = httpMock.expectOne('http://localhost/test/endpoint');
    expect(req.request.method).toBe('GET');
    req.flush({ payload: 'ok' });
    expect(result).toEqual({ payload: 'ok' });
  });

  it('should append url params and map delete response', () => {
    let result: any;
    service.delete('/resource', '?active=true').subscribe((res) => (result = res));
    const req = httpMock.expectOne('http://localhost/resource?active=true');
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
    expect(result).toEqual({ ok: true });
  });

  it('should POST with JSON headers and map body', () => {
    const payload = { message: 'hello' };
    let response: any;
    service.post('/messages', payload).subscribe((res) => (response = res));

    const req = httpMock.expectOne('http://localhost/messages');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush({ id: 1, ...payload });

    expect(response).toEqual({ id: 1, ...payload });
  });

  it('should PUT with JSON headers and map body', () => {
    const payload = { id: 2, name: 'Updated' };
    let response: any;
    service.put('items/2', payload).subscribe((res) => (response = res));

    const req = httpMock.expectOne('http://localhost/items/2');
    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    req.flush(payload);

    expect(response).toEqual(payload);
  });
});
