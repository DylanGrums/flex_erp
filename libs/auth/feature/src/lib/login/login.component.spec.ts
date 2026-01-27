import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { Store } from '@ngxs/store';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let storeMock: { dispatch: jest.Mock; selectSnapshot: jest.Mock };

  beforeEach(
    waitForAsync(() => {
      storeMock = {
        dispatch: jest.fn(),
        selectSnapshot: jest.fn().mockReturnValue(false),
      };

      TestBed.configureTestingModule({
        imports: [
          LoginComponent,
          TranslocoTestingModule.forRoot({ langs: {}, preloadLangs: true }),
        ],
        providers: [
          { provide: Store, useValue: storeMock },
        ],
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch login when authenticated', () => {
    storeMock.dispatch.mockReturnValue(of({ user: 'test' }));

    component.onSubmit({ email: 'user@test.com', password: '123456' });

    expect(storeMock.dispatch).toHaveBeenCalled();
  });

  it('should set error flag when dispatch throws', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    storeMock.dispatch.mockImplementation(() => {
      throw new Error('dispatch failed');
    });

    component.onSubmit({ email: 'user@test.com', password: '123456' });
    expect(component.error).toBe(true);
    errorSpy.mockRestore();
  });

  it('should reset error state', () => {
    component.error = true;
    component.onReset();
    expect(component.error).toBe(false);
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
