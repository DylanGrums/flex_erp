import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { API_BASE_URL } from '../../../../tokens';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { Store } from '@ngxs/store';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let storeMock: { dispatch: jest.Mock; selectSnapshot: jest.Mock };
  let dialogRefMock: { close: jest.Mock };

  beforeEach(
    waitForAsync(() => {
      storeMock = {
        dispatch: jest.fn(),
        selectSnapshot: jest.fn().mockReturnValue(false),
      };
      dialogRefMock = { close: jest.fn() };

      TestBed.configureTestingModule({
        imports: [
          LoginComponent,
          NoopAnimationsModule,
          HttpClientTestingModule,
          RouterTestingModule,
        ],
        providers: [
          { provide: API_BASE_URL, useValue: 'http://localhost' },
          { provide: DynamicDialogRef, useValue: dialogRefMock },
          { provide: Store, useValue: storeMock },
        ],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose controls via getter', () => {
    expect(component.f.email).toBeDefined();
    expect(component.f.password).toBeDefined();
  });

  it('should mark form as submitted and touched when invalid', async () => {
    await component.onSubmit();
    expect(component.submitted).toBe(true);
    const touched = Object.values(component.loginForm.controls).every(
      (control) => control.touched,
    );
    expect(touched).toBe(true);
  });

  it('should dispatch login and close when authenticated', async () => {
    storeMock.dispatch.mockReturnValue(of({ user: 'test' }));
    storeMock.selectSnapshot.mockImplementation((selector: any) =>
      selector(true),
    );
    component.loginForm.setValue({
      email: 'user@test.com',
      password: '123456',
    });

    await component.onSubmit();

    expect(storeMock.dispatch).toHaveBeenCalled();
    expect(dialogRefMock.close).toHaveBeenCalledWith({ user: 'test' });
  });

  it('should set error flag when dispatch throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    storeMock.dispatch.mockImplementation(() => {
      throw new Error('dispatch failed');
    });
    component.loginForm.setValue({
      email: 'user@test.com',
      password: '123456',
    });

    await component.onSubmit();
    expect(component.error).toBe(true);
    errorSpy.mockRestore();
  });

  it('should reset form state', () => {
    component.submitted = true;
    component.loginForm.setValue({ email: 'x', password: 'y' });
    component.onReset();
    expect(component.submitted).toBe(false);
    expect(component.loginForm.value).toEqual({ email: null, password: null });
  });

  it('should warn for social logins', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    component.loginWithGoogle();
    component.loginWithGithub();
    component.loginWithDiscord();
    expect(warnSpy).toHaveBeenCalledTimes(3);
    warnSpy.mockRestore();
  });
});
